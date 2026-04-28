import { notFound } from 'next/navigation';
import { fetchResume, resolveDidToHandle, resolvePdsUrl } from '@/lib/atproto';
import { getSession } from '@/lib/auth';
import { ResumeView } from '@/components/ResumeView';

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
  let did = '';
  try {
    [resume, { did }] = await Promise.all([
      fetchResume(handle, rkey),
      resolvePdsUrl(handle),
    ]);
  } catch {
    notFound();
  }

  const session = await getSession();
  const isOwner = !!session.did && session.did === did;

  const hasAnyData = resume.basics || !!resume.work?.length || !!resume.education?.length;
  if (!hasAnyData) notFound();

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

  return <ResumeView resume={resume} handle={handle} rkey={rkey} isOwner={isOwner} didHandles={didHandles} />;
}
