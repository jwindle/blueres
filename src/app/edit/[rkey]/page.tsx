import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getAgent } from '@/lib/atproto';
import { NSID } from '@/lib/lexicons';
import { ResumeEditor } from '@/components/editor/ResumeEditor';
import type { ResumeData } from '@/lib/types';

interface Props {
  params: Promise<{ rkey: string }>;
}

export default async function EditResumePage({ params }: Props) {
  const { rkey } = await params;

  const session = await getSession();
  if (!session.did) redirect('/');

  const agent = await getAgent();
  if (!agent) redirect('/');

  let resume: ResumeData = {};
  try {
    const { data } = await agent.com.atproto.repo.getRecord({
      repo: session.did,
      collection: NSID.RESUME,
      rkey,
    });
    resume = data.value as ResumeData;
  } catch { /* new or missing record — start empty */ }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href={`/resumes/${encodeURIComponent(session.handle!)}`} className="text-sm text-gray-400 hover:text-gray-700">
            ← All resumes
          </Link>
          <h1 className="text-2xl font-bold mt-1">
            {resume.meta?.title || 'Untitled Resume'}
          </h1>
          <p className="text-sm text-gray-500">Stored on your Bluesky PDS</p>
        </div>
        <Link
          href={`/resumes/${session.handle}/${rkey}`}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-100"
        >
          Preview
        </Link>
      </div>

      <ResumeEditor rkey={rkey} resume={resume} handle={session.handle!} />
    </main>
  );
}
