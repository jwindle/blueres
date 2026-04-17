import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { oauthClient } from '@/lib/oauth';

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
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-bold tracking-tight">Sign in with Bluesky</h1>
        <p className="mb-8 text-fg-muted">Enter your handle to connect your account.</p>

        <form action={initiateAuth} className="space-y-4">
          <div>
            <label htmlFor="handle" className="block text-sm font-medium mb-1">
              Bluesky handle
            </label>
            <input
              id="handle"
              name="handle"
              type="text"
              required
              autoComplete="username"
              placeholder="you.bsky.social"
              className="w-full rounded-lg border border-line-strong px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorMessages[error] ?? 'Something went wrong. Please try again.'}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
