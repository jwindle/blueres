'use server';

import { getAgent } from '@/lib/atproto';
import { getSession } from '@/lib/auth';
import { NSID, BASICS_RKEY } from '@/lib/lexicons';
import type { Basics, ResumeData } from '@/lib/types';

// ─── Basics ────────────────────────────────────────────────────────────────

export async function saveBasics(data: Basics): Promise<void> {
  const session = await getSession();
  if (!session.did) throw new Error('Not authenticated');
  const agent = await getAgent();
  if (!agent) throw new Error('Not authenticated');

  const record = { ...data };
  if (record.location && Object.values(record.location).every(v => !v)) {
    delete record.location;
  }
  if (!record.profiles?.length) delete record.profiles;

  await agent.com.atproto.repo.putRecord({
    repo: session.did,
    collection: NSID.BASICS,
    rkey: BASICS_RKEY,
    record: { $type: NSID.BASICS, ...record },
  });
}

// ─── Collections ───────────────────────────────────────────────────────────

/** Creates a record and returns the new rkey. */
export async function createCollectionRecord(
  collection: string,
  fields: Record<string, unknown>,
): Promise<string> {
  const session = await getSession();
  if (!session.did) throw new Error('Not authenticated');
  const agent = await getAgent();
  if (!agent) throw new Error('Not authenticated');

  const { data } = await agent.com.atproto.repo.createRecord({
    repo: session.did,
    collection,
    record: { $type: collection, ...fields },
  });

  return data.uri.split('/').pop()!;
}

export async function updateCollectionRecord(
  collection: string,
  rkey: string,
  fields: Record<string, unknown>,
): Promise<void> {
  const session = await getSession();
  if (!session.did) throw new Error('Not authenticated');
  const agent = await getAgent();
  if (!agent) throw new Error('Not authenticated');

  await agent.com.atproto.repo.putRecord({
    repo: session.did,
    collection,
    rkey,
    record: { $type: collection, ...fields },
  });
}

export async function deleteCollectionRecord(
  collection: string,
  rkey: string,
): Promise<void> {
  const session = await getSession();
  if (!session.did) throw new Error('Not authenticated');
  const agent = await getAgent();
  if (!agent) throw new Error('Not authenticated');

  await agent.com.atproto.repo.deleteRecord({
    repo: session.did,
    collection,
    rkey,
  });
}

// ─── Section replace (used by import) ──────────────────────────────────────

/**
 * Deletes all existing records in a collection, creates the provided items,
 * and returns the new records with their server-assigned rkeys.
 */
export async function replaceSection(
  collection: string,
  items: Record<string, unknown>[],
): Promise<Array<{ rkey: string; value: Record<string, unknown> }>> {
  const session = await getSession();
  if (!session.did) throw new Error('Not authenticated');
  const agent = await getAgent();
  if (!agent) throw new Error('Not authenticated');

  const repo = session.did;

  // Delete existing
  try {
    const { data: list } = await agent.com.atproto.repo.listRecords({ repo, collection, limit: 100 });
    await Promise.all(
      list.records.map(r =>
        agent.com.atproto.repo.deleteRecord({ repo, collection, rkey: r.uri.split('/').pop()! }),
      ),
    );
  } catch { /* collection not yet created */ }

  // Create new in reverse order so listRecords (newest-TID-first) returns them
  // in the original order.
  const created: Array<{ rkey: string; value: Record<string, unknown> }> = [];
  for (const item of [...items].reverse()) {
    const { data } = await agent.com.atproto.repo.createRecord({
      repo,
      collection,
      record: { $type: collection, ...item },
    });
    created.push({ rkey: data.uri.split('/').pop()!, value: item });
  }
  return created.reverse();
}
