import { NextResponse } from 'next/server';
import { listResumes } from '@/lib/atproto';

export async function GET(_req: Request, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  try {
    const resumes = await listResumes(handle);
    if (resumes.length === 0) {
      return NextResponse.json({ error: 'No resumes found' }, { status: 404 });
    }
    // Return the most recently created resume (first by TID order)
    return NextResponse.json(resumes[0].data);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
