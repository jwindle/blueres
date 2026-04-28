import { getSession } from '@/lib/auth';
import { HandleInput } from '@/components/HandleInput';
import Link from 'next/link';

export default async function LandingPage() {
  const session = await getSession();
  const placeholder = session.handle ?? session.did ?? 'windle.bsky.social';

  return (
    <main className="p-4">
      <div className="max-w-sm mx-auto mt-16 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">
          Browse Résumés
        </h1>
        <HandleInput placeholder={placeholder} />
        {!session.did && (
          <p className="text-sm text-fg-muted">
            <Link href="/sign-in" className="text-blue-600 hover:underline">
              Log in
            </Link>{' '}
            to edit your profile.
          </p>
        )}
      </div>
    </main>
  );
}
