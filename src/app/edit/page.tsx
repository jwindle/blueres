import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getAgent } from '@/lib/atproto';
import { NSID } from '@/lib/lexicons';
import { createResume, deleteResume, duplicateResume, hasLegacyData, deleteAllLegacyData } from './actions';
import { DeleteResumeButton } from './DeleteResumeButton';
import type { ResumeData } from '@/lib/types';

export default async function EditPage() {
  const session = await getSession();
  if (!session.did) redirect('/');

  const agent = await getAgent();
  if (!agent) redirect('/');

  // Fetch all resume records
  let resumes: { rkey: string; data: ResumeData }[] = [];
  try {
    const { data } = await agent.com.atproto.repo.listRecords({
      repo: session.did,
      collection: NSID.RESUME,
      limit: 100,
    });
    resumes = data.records.map(r => ({
      rkey: r.uri.split('/').pop()!,
      data: r.value as ResumeData,
    }));
  } catch { /* none yet */ }

  const legacy = await hasLegacyData();
  const handle = session.handle!;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Resumes</h1>
          <p className="text-sm text-gray-500">Stored on your Bluesky PDS</p>
        </div>
        <form action={createResume}>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + New Resume
          </button>
        </form>
      </div>

      {resumes.length === 0 && (
        <p className="text-sm text-gray-500 italic">No resumes yet. Create one to get started.</p>
      )}

      <div className="space-y-3">
        {resumes.map(({ rkey, data }) => (
          <div
            key={rkey}
            className="rounded-xl border border-line bg-surface overflow-hidden"
          >
            <div className="flex items-start justify-between px-5 py-4">
              <div className="min-w-0 mr-4">
                <p className="font-semibold">{data.meta?.title || 'Untitled Resume'}</p>
                {data.basics?.name && (
                  <p className="text-sm text-gray-500 mt-0.5">{data.basics.name}</p>
                )}
                {data.basics?.summary && (
                  <p className="text-sm text-fg-muted mt-1 line-clamp-2">{data.basics.summary}</p>
                )}
                {data.meta?.lastModified && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    Last saved {new Date(data.meta.lastModified).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/resume/${handle}/${rkey}`}
                  target="_blank"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  Preview
                </Link>
                <form action={async () => { 'use server'; await duplicateResume(rkey); }}>
                  <button type="submit" className="text-sm text-gray-500 hover:text-blue-600">
                    Duplicate
                  </button>
                </form>
                <Link
                  href={`/edit/${rkey}`}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Edit
                </Link>
                <DeleteResumeButton action={async () => { 'use server'; await deleteResume(rkey); }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {legacy && (
        <div className="mt-10 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="font-semibold text-amber-800 mb-1">Legacy data found</p>
          <p className="text-sm text-amber-700 mb-3">
            Your PDS still contains records from the old per-section schema. These are no longer used.
          </p>
          <form action={deleteAllLegacyData}>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Delete legacy data
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
