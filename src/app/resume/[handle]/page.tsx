import { redirect } from 'next/navigation';
import Link from 'next/link';
import { listResumes } from '@/lib/atproto';
import { HandleInput } from '@/components/HandleInput';

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  return { title: `${handle} — BlueRes` };
}

export default async function ResumeListPage({ params }: Props) {
  const { handle } = await params;

  let resumes: Awaited<ReturnType<typeof listResumes>> = [];
  try {
    resumes = await listResumes(handle);
  } catch {
    return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6"><HandleInput defaultValue={handle} /></div>
        <p className="text-sm text-red-600">
          Couldn&apos;t resolve &ldquo;{handle}&rdquo;. Make sure it&apos;s a valid Bluesky handle.
        </p>
      </main>
    );
  }

  // If exactly one resume, go straight to it
  if (resumes.length === 1) {
    redirect(`/resume/${handle}/${resumes[0].rkey}`);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6"><HandleInput defaultValue={handle} /></div>

      {resumes.length === 0 && (
        <p className="text-sm text-gray-500">No resumes found for &ldquo;{handle}&rdquo;.</p>
      )}

      {resumes.length > 1 && (
        <>
          <h1 className="text-2xl font-bold mb-4">{handle}&apos;s Resumes</h1>
          <div className="space-y-3">
            {resumes.map(({ rkey, data }) => (
              <Link
                key={rkey}
                href={`/resume/${handle}/${rkey}`}
                className="flex items-center justify-between rounded-xl border border-line bg-surface px-5 py-4 hover:bg-raised transition-colors"
              >
                <div>
                  <p className="font-semibold">{data.meta?.title || 'Untitled Resume'}</p>
                  {data.meta?.lastModified && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Updated {new Date(data.meta.lastModified).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className="text-sm text-blue-600">View →</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
