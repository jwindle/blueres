import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication.
const PROTECTED = ['/edit'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // iron-session uses an httpOnly cookie — we can't decrypt it in the Edge
  // runtime, so we check for the cookie's mere presence as a lightweight gate.
  // The actual session validation happens in each Server Component/Action.
  const sessionCookie = request.cookies.get('blueres_session');
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/edit/:path*'],
};
