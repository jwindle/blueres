import { NextResponse } from 'next/server';
import { fetchResumeData } from '@/lib/atproto';

export async function GET(_req: Request, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  try {
    const resume = await fetchResumeData(handle);
    return NextResponse.json(resume);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
