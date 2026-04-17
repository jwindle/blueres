import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { getSession } from '@/lib/auth';
import { oauthClient } from '@/lib/oauth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'BlueRes — Resume on Bluesky',
  description: 'Store and share your resume on your Bluesky PDS.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  async function logout() {
    'use server';
    const sess = await getSession();
    if (sess.did) {
      try { await oauthClient.revoke(sess.did); } catch { /* best-effort */ }
    }
    sess.destroy();
    redirect('/');
  }

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-canvas text-fg antialiased">
        <Navbar handle={session.handle} logoutAction={session.did ? logout : null} />
        {children}
      </body>
    </html>
  );
}
