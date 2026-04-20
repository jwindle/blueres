import { NextResponse } from 'next/server';
import { fetchResume } from '@/lib/atproto';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ handle: string; rkey: string }> },
) {
  const { handle, rkey } = await params;

  try {
    const resume = await fetchResume(handle, rkey);
    return NextResponse.json(resume);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
