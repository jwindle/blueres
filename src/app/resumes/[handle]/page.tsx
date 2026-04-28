import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { listResumes } from '@/lib/atproto';
import { createResume, deleteResume, duplicateResume, hasLegacyData, deleteAllLegacyData } from '@/app/edit/actions';
import { DeleteResumeButton } from '@/app/edit/DeleteResumeButton';
import type { ResumeRecord } from '@/lib/types';

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  return { title: `${handle} — BlueRes` };
}

export default async function ResumeListPage({ params }: Props) {
  const { handle } = await params;

  let records: ResumeRecord[] = [];
  let did = '';
  try {
    ({ records, did } = await listResumes(handle));
  } catch {
    return notFound();
  }

  const session = await getSession();
  const isOwner = !!session.did && session.did === did;

  const visible = isOwner ? records : records.filter(r => r.data.meta?.active);

  // Non-owners with a single active resume go straight to it
  if (!isOwner && visible.length === 1) {
    redirect(`/resumes/${handle}/${visible[0].rkey}`);
  }

  const legacy = isOwner ? await hasLegacyData() : false;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{handle}&apos;s Resumes</h1>
          <p className="text-sm text-gray-500">Stored on your Bluesky PDS</p>
        </div>
        {isOwner && (
          <form action={createResume}>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + New Resume
            </button>
          </form>
        )}
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          {isOwner ? 'No resumes yet. Create one to get started.' : `No resumes found for "${handle}".`}
        </p>
      )}

      <div className="space-y-3">
        {visible.map(({ rkey, data }) => (
          <div key={rkey} className="rounded-xl border border-line bg-surface overflow-hidden">
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/resumes/${handle}/${rkey}`}
                  className="font-semibold hover:underline text-blue-600"
                >
                  {data.meta?.title || 'Untitled Resume'}
                  {isOwner && !data.meta?.active ? ' (Inactive)' : ''}
                </Link>
                {isOwner && (
                  <div className="flex shrink-0 gap-1">
                    <form action={async () => { 'use server'; await duplicateResume(rkey); }} className="flex">
                      <button type="submit" className="text-xs px-2 py-0.5 rounded border border-line text-fg-muted hover:text-fg">
                        Duplicate
                      </button>
                    </form>
                    <Link
                      href={`/edit/${rkey}`}
                      className="text-xs px-2 py-0.5 rounded border border-line text-fg-muted hover:text-fg"
                    >
                      Edit
                    </Link>
                    <DeleteResumeButton action={async () => { 'use server'; await deleteResume(rkey); }} />
                  </div>
                )}
              </div>
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
