import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { oauthClient } from '@/lib/oauth';
import Link from 'next/link';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session.did) redirect('/edit');

  const { error } = await searchParams;

  async function initiateAuth(formData: FormData) {
    'use server';
    const handle = (formData.get('handle') as string).trim();
    const url = await oauthClient
      .authorize(handle, { scope: 'atproto transition:generic' })
      .catch(() => null);
    if (!url) redirect('/sign-in?error=resolve_failed');
    redirect(url.toString());
  }

  const errorMessages: Record<string, string> = {
    resolve_failed: "Couldn't resolve that handle. Make sure it's a valid Bluesky handle.",
    oauth_failed:   'Authorization failed. Please try again.',
  };

  return (
    <main className="p-4">
      <div className="max-w-sm mx-auto mt-16 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Log in to BlueRes</h1>
        <p className="text-fg-muted">
          Create and manage your resume stored on the AT Protocol.
        </p>

        <form action={initiateAuth} className="flex flex-col gap-3">
          <input
            id="handle"
            name="handle"
            type="text"
            required
            autoComplete="username"
            placeholder="your.bsky.handle"
            className="w-full rounded-lg border border-line-strong px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-surface"
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorMessages[error] ?? 'Something went wrong. Please try again.'}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Log in with Bluesky
          </button>
        </form>

        <p className="text-sm text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            Browse résumés without logging in →
          </Link>
        </p>
      </div>
    </main>
  );
}
