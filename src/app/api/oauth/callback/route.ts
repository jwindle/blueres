import { NextRequest, NextResponse } from 'next/server';
import { oauthClient } from '@/lib/oauth';
import { getSession } from '@/lib/auth';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const { session } = await oauthClient.callback(params);

    const ironSession = await getSession();
    ironSession.did = session.did;

    try {
      const res = await fetch(
        `https://bsky.social/xrpc/com.atproto.repo.describeRepo?repo=${encodeURIComponent(session.did)}`,
      );
      if (res.ok) {
        const data = await res.json();
        ironSession.handle = data.handle as string;
      }
    } catch { /* handle resolution is best-effort */ }

    await ironSession.save();

    return NextResponse.redirect(new URL('/edit', APP_URL));
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(new URL('/sign-in?error=oauth_failed', APP_URL));
  }
}
