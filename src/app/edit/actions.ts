'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAgent } from '@/lib/atproto';
import { getSession } from '@/lib/auth';
import { NSID, LEGACY_NSIDS } from '@/lib/lexicons';
import type { ResumeData } from '@/lib/types';

// ─── Resume CRUD ────────────────────────────────────────────────────────────

/**
 * Creates or updates a resume record.
 * Pass rkey=null to create a new record (returns the new rkey).
 */
export async function saveResume(rkey: string | null, data: ResumeData): Promise<string> {
  const session = await getSession();
  if (!session.did) throw new Error('Not authenticated');
  const agent = await getAgent();
  if (!agent) throw new Error('Not authenticated');

  const record = buildRecord(data);

  if (rkey) {
    await agent.com.atproto.repo.putRecord({
      repo: session.did,
      collection: NSID.RESUME,
      rkey,
      record: { $type: NSID.RESUME, ...record },
    });
    return rkey;
  } else {
    const { data: result } = await agent.com.atproto.repo.createRecord({
      repo: session.did,
      collection: NSID.RESUME,
      record: { $type: NSID.RESUME, ...record },
    });
    return result.uri.split('/').pop()!;
  }
}

/** Creates a new empty resume and redirects to its edit page. */
export async function createResume(): Promise<never> {
  const newRkey = await saveResume(null, {});
  redirect(`/edit/${newRkey}`);
}

export async function duplicateResume(rkey: string): Promise<never> {
  const session = await getSession();
  if (!session.did) throw new Error('Not authenticated');
  const agent = await getAgent();
  if (!agent) throw new Error('Not authenticated');

  const { data } = await agent.com.atproto.repo.getRecord({
    repo: session.did,
    collection: NSID.RESUME,
    rkey,
  });

  const original = data.value as ResumeData;
  const copy: ResumeData = {
    ...original,
    $type: undefined,
    meta: {
      ...original.meta,
      title: original.meta?.title ? `${original.meta.title} (copy)` : 'Copy',
    },
  };

  const newRkey = await saveResume(null, copy);
  redirect(`/edit/${newRkey}`);
}

export async function deleteResume(rkey: string): Promise<void> {
  const session = await getSession();
  if (!session.did) throw new Error('Not authenticated');
  const agent = await getAgent();
  if (!agent) throw new Error('Not authenticated');

  await agent.com.atproto.repo.deleteRecord({
    repo: session.did,
    collection: NSID.RESUME,
    rkey,
  });

  revalidatePath('/edit');
}

// ─── Migration cleanup ───────────────────────────────────────────────────────

/** Returns true if the user still has records in any legacy per-section collection. */
export async function hasLegacyData(): Promise<boolean> {
  const session = await getSession();
  if (!session.did) return false;
  const agent = await getAgent();
  if (!agent) return false;

  try {
    const { data } = await agent.com.atproto.repo.listRecords({
      repo: session.did,
      collection: NSID.BASICS,
      limit: 1,
    });
    return data.records.length > 0;
  } catch {
    return false;
  }
}

/** Deletes all records from all 12 legacy per-section collections. */
export async function deleteAllLegacyData(): Promise<void> {
  const session = await getSession();
  if (!session.did) throw new Error('Not authenticated');
  const agent = await getAgent();
  if (!agent) throw new Error('Not authenticated');

  const repo = session.did;

  await Promise.all(
    LEGACY_NSIDS.map(async nsid => {
      try {
        const { data } = await agent.com.atproto.repo.listRecords({ repo, collection: nsid, limit: 100 });
        await Promise.all(
          data.records.map(r =>
            agent.com.atproto.repo.deleteRecord({ repo, collection: nsid, rkey: r.uri.split('/').pop()! }),
          ),
        );
      } catch { /* collection didn't exist */ }
    }),
  );

  revalidatePath('/edit');
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildRecord(data: ResumeData): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  if (data.basics) {
    const b = { ...data.basics };
    delete b.$type;
    if (b.location && Object.values(b.location).every(v => !v)) delete b.location;
    if (!b.profiles?.length) delete b.profiles;
    if (Object.values(b).some(v => v !== undefined)) out.basics = b;
  }

  const collections = [
    'work', 'volunteer', 'education', 'awards', 'certificates',
    'publications', 'skills', 'languages', 'interests', 'references', 'projects',
  ] as const;

  for (const key of collections) {
    const items = data[key];
    if (items?.length) {
      out[key] = items.map(item => {
        const i = { ...(item as Record<string, unknown>) };
        delete i.$type;
        return i;
      });
    }
  }

  out.meta = {
    ...(data.meta ?? {}),
    lastModified: new Date().toISOString(),
  };

  return out;
}
