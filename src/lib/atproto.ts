import { Agent, AtpAgent } from '@atproto/api';
import { getSession } from './auth';
import { oauthClient } from './oauth';
import { NSID, BASICS_RKEY } from './lexicons';
import type { ResumeData, Basics, Work, Education, Volunteer, Award, Certificate, Publication, Skill, Language, Interest, Reference, Project } from './types';

/**
 * Returns an authenticated Agent using the stored OAuth session.
 * Returns null if no valid session exists.
 */
export async function getAgent(): Promise<Agent | null> {
  const session = await getSession();
  if (!session.did) return null;

  try {
    const oauthSession = await oauthClient.restore(session.did);
    return new Agent(oauthSession);
  } catch {
    return null;
  }
}

/**
 * Resolve a Bluesky handle to a DID, then derive the PDS service URL
 * by reading the DID document from the PLC directory.
 */
export async function resolvePdsUrl(handle: string): Promise<{ did: string; pdsUrl: string }> {
  const agent = new AtpAgent({ service: 'https://bsky.social' });
  const { data } = await agent.com.atproto.identity.resolveHandle({ handle });
  const did = data.did;
  const pdsUrl = await getPdsFromDid(did);
  return { did, pdsUrl };
}

async function getPdsFromDid(did: string): Promise<string> {
  try {
    let docUrl: string;
    if (did.startsWith('did:plc:')) {
      docUrl = `https://plc.directory/${did}`;
    } else if (did.startsWith('did:web:')) {
      const domain = did.slice('did:web:'.length);
      docUrl = `https://${domain}/.well-known/did.json`;
    } else {
      return 'https://bsky.social';
    }

    const res = await fetch(docUrl, { next: { revalidate: 300 } });
    if (!res.ok) return 'https://bsky.social';
    const doc = await res.json();

    const service = (doc.service as Array<{ id: string; type: string; serviceEndpoint: string }> | undefined)
      ?.find(s => s.id === '#atproto_pds' || s.type === 'AtprotoPersonalDataServer');

    return service?.serviceEndpoint ?? 'https://bsky.social';
  } catch {
    return 'https://bsky.social';
  }
}

/**
 * Resolve a DID to its current handle. Returns null on failure.
 */
export async function resolveDidToHandle(did: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://bsky.social/xrpc/com.atproto.repo.describeRepo?repo=${encodeURIComponent(did)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.handle as string) ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch all resume sections for a given handle from their PDS.
 * Public read — no authentication required.
 */
export async function fetchResumeData(handle: string): Promise<ResumeData> {
  const { did, pdsUrl } = await resolvePdsUrl(handle);
  const agent = new AtpAgent({ service: pdsUrl });

  const [
    basicsResult,
    workResult,
    educationResult,
    volunteerResult,
    awardsResult,
    certificatesResult,
    publicationsResult,
    skillsResult,
    languagesResult,
    interestsResult,
    referencesResult,
    projectsResult,
  ] = await Promise.allSettled([
    agent.com.atproto.repo.getRecord({ repo: did, collection: NSID.BASICS, rkey: BASICS_RKEY }),
    agent.com.atproto.repo.listRecords({ repo: did, collection: NSID.WORK,         limit: 100 }),
    agent.com.atproto.repo.listRecords({ repo: did, collection: NSID.EDUCATION,    limit: 100 }),
    agent.com.atproto.repo.listRecords({ repo: did, collection: NSID.VOLUNTEER,    limit: 100 }),
    agent.com.atproto.repo.listRecords({ repo: did, collection: NSID.AWARDS,       limit: 100 }),
    agent.com.atproto.repo.listRecords({ repo: did, collection: NSID.CERTIFICATES, limit: 100 }),
    agent.com.atproto.repo.listRecords({ repo: did, collection: NSID.PUBLICATIONS, limit: 100 }),
    agent.com.atproto.repo.listRecords({ repo: did, collection: NSID.SKILLS,       limit: 100 }),
    agent.com.atproto.repo.listRecords({ repo: did, collection: NSID.LANGUAGES,    limit: 100 }),
    agent.com.atproto.repo.listRecords({ repo: did, collection: NSID.INTERESTS,    limit: 100 }),
    agent.com.atproto.repo.listRecords({ repo: did, collection: NSID.REFERENCES,   limit: 100 }),
    agent.com.atproto.repo.listRecords({ repo: did, collection: NSID.PROJECTS,     limit: 100 }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function records<T>(result: PromiseSettledResult<any>): T[] {
    return result.status === 'fulfilled' ? result.value.data.records.map((r: { value: unknown }) => r.value as T) : [];
  }

  return {
    basics:       basicsResult.status === 'fulfilled' ? (basicsResult.value.data.value as Basics) : null,
    work:         records<Work>(workResult),
    education:    records<Education>(educationResult),
    volunteer:    records<Volunteer>(volunteerResult),
    awards:       records<Award>(awardsResult),
    certificates: records<Certificate>(certificatesResult),
    publications: records<Publication>(publicationsResult),
    skills:       records<Skill>(skillsResult),
    languages:    records<Language>(languagesResult),
    interests:    records<Interest>(interestsResult),
    references:   records<Reference>(referencesResult),
    projects:     records<Project>(projectsResult),
  };
}
