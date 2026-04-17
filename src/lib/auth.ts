import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  /** The user's DID. Present when logged in. */
  did?: string;
  /** The user's AT Protocol handle, e.g. alice.bsky.social */
  handle?: string;
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'blueres_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
