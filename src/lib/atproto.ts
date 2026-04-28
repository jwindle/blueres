import { Agent, AtpAgent } from '@atproto/api';
import { getSession } from './auth';
import { oauthClient } from './oauth';
import { NSID } from './lexicons';
import type { ResumeData, ResumeRecord } from './types';

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

export async function listResumes(handle: string): Promise<{ records: ResumeRecord[]; did: string }> {
  const { did, pdsUrl } = await resolvePdsUrl(handle);
  const agent = new AtpAgent({ service: pdsUrl });

  try {
    const { data } = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: NSID.RESUME,
      limit: 100,
    });
    return {
      records: data.records.map(r => ({
        rkey: r.uri.split('/').pop()!,
        data: r.value as ResumeData,
      })),
      did,
    };
  } catch {
    return { records: [], did };
  }
}

export async function fetchResume(handle: string, rkey: string): Promise<ResumeData> {
  const { did, pdsUrl } = await resolvePdsUrl(handle);
  const agent = new AtpAgent({ service: pdsUrl });

  const { data } = await agent.com.atproto.repo.getRecord({
    repo: did,
    collection: NSID.RESUME,
    rkey,
  });

  return data.value as ResumeData;
}
