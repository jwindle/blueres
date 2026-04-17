import Link from 'next/link';

interface NavbarProps {
  handle?: string;
  logoutAction: (() => Promise<void>) | null;
}

export function Navbar({ handle, logoutAction }: NavbarProps) {
  return (
    <nav className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          BlueRes
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {handle && logoutAction ? (
            <>
              <Link href="/edit" className="text-fg-muted hover:text-fg">
                Edit {handle}
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="text-fg-muted hover:text-fg">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/sign-in" className="text-fg-muted hover:text-fg">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
