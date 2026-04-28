import { getSession } from '@/lib/auth';
import { HandleInput } from '@/components/HandleInput';
import Link from 'next/link';

export default async function LandingPage() {
  const session = await getSession();

  return (
    <main className="p-4">
      <div className="w-full max-w-sm mx-auto mt-16">
        <h1 className="mb-1 text-3xl font-bold tracking-tight">BlueRes</h1>
        <p className="mb-8 text-fg-muted">View any resume stored on the AT Protocol.</p>
        <HandleInput />
        {!session.did && (
          <p className="mt-6 text-center text-sm text-fg-muted">
            or{' '}
            <Link href="/sign-in" className="underline hover:text-fg">
              log in to edit your profile
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
