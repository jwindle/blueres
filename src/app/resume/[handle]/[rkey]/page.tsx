import { fetchResume, resolveDidToHandle } from '@/lib/atproto';
import { ResumeView } from '@/components/ResumeView';
import { HandleInput } from '@/components/HandleInput';

interface Props {
  params: Promise<{ handle: string; rkey: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  return { title: `${handle} — BlueRes` };
}

export default async function ResumePage({ params }: Props) {
  const { handle, rkey } = await params;

  let resume;
  try {
    resume = await fetchResume(handle, rkey);
  } catch {
    return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6"><HandleInput defaultValue={handle} /></div>
        <p className="text-sm text-red-600">
          Couldn&apos;t load this resume. The record may not exist.
        </p>
      </main>
    );
  }

  const hasAnyData = resume.basics || !!resume.work?.length || !!resume.education?.length;
  if (!hasAnyData) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6"><HandleInput defaultValue={handle} /></div>
        <p className="text-sm text-gray-500">This resume has no content yet.</p>
      </main>
    );
  }

  // Resolve all DIDs mentioned in the resume to handles for display
  const didSet = new Set<string>();
  const addDid = (v: unknown) => { if (typeof v === 'string' && v.startsWith('did:')) didSet.add(v); };
  [...(resume.work ?? []), ...(resume.education ?? []), ...(resume.volunteer ?? []),
   ...(resume.publications ?? []), ...(resume.references ?? []), ...(resume.projects ?? [])]
    .forEach(r => addDid((r as Record<string, unknown>).did));

  const resolved = await Promise.all(
    [...didSet].map(async did => [did, await resolveDidToHandle(did)] as const),
  );
  const didHandles = new Map(resolved.filter(([, h]) => h !== null) as [string, string][]);

  return (
    <>
      <div className="border-b border-line bg-canvas px-6 py-3">
        <div className="mx-auto max-w-3xl">
          <HandleInput defaultValue={handle} />
        </div>
      </div>
      <ResumeView resume={resume} handle={handle} rkey={rkey} didHandles={didHandles} />
    </>
  );
}
