import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getAgent } from '@/lib/atproto';
import { NSID, BASICS_RKEY } from '@/lib/lexicons';
import { SECTIONS } from '@/lib/sections';
import { ResumeEditor } from '@/components/editor/ResumeEditor';
import type { Basics } from '@/lib/types';
import Link from 'next/link';

export default async function EditPage() {
  const session = await getSession();
  if (!session.did) redirect('/');

  const agent = await getAgent();
  if (!agent) redirect('/');

  // Fetch basics
  let basics: Basics | null = null;
  try {
    const { data } = await agent.com.atproto.repo.getRecord({
      repo: session.did,
      collection: NSID.BASICS,
      rkey: BASICS_RKEY,
    });
    basics = data.value as Basics;
  } catch { /* not yet created */ }

  // Fetch all collection sections in parallel
  const sections = await Promise.all(
    SECTIONS.map(async section => {
      try {
        const { data } = await agent.com.atproto.repo.listRecords({
          repo: session.did!,
          collection: section.nsid,
          limit: 100,
        });
        return {
          section,
          records: data.records.map(r => ({
            rkey: r.uri.split('/').pop()!,
            value: r.value as Record<string, unknown>,
          })),
        };
      } catch {
        return { section, records: [] };
      }
    }),
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Resume</h1>
            <p className="text-sm text-gray-500">Stored on your Bluesky PDS</p>
          </div>
          <Link
            href={`/resume/${session.handle}`}
            target="_blank"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Preview
          </Link>
        </div>

        <ResumeEditor basics={basics} sections={sections} />
      </main>
  );
}
