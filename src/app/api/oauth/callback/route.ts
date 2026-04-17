import { NextRequest, NextResponse } from 'next/server';
import { Agent } from '@atproto/api';
import { oauthClient } from '@/lib/oauth';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const params = new URLSearchParams(request.nextUrl.search);

  let session;
  try {
    ({ session } = await oauthClient.callback(params));
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(new URL('/sign-in?error=oauth_failed', request.url));
  }

  // Resolve the DID to a handle.
  let handle: string = session.did;
  try {
    const agent = new Agent(session);
    const { data } = await agent.com.atproto.repo.describeRepo({ repo: session.did });
    handle = data.handle as string;
  } catch {
    // Not fatal — we just won't have a pretty handle.
  }

  const ironSession = await getSession();
  ironSession.did = session.did;
  ironSession.handle = handle;
  await ironSession.save();

  return NextResponse.redirect(new URL('/edit', request.url));
}
