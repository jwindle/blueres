import { NextResponse } from 'next/server';
import { oauthClient } from '@/lib/oauth';

/**
 * Serves the OAuth client metadata document.
 * The URL of this endpoint must match the `client_id` in src/lib/oauth.ts.
 *
 * The Bluesky PDS fetches this URL when initiating the OAuth flow, so it must
 * be publicly reachable. For local development, use a tunnel (e.g. ngrok) and
 * set APP_URL in .env.local to the tunnel URL.
 */
export async function GET() {
  return NextResponse.json(oauthClient.clientMetadata, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    },
  });
}
