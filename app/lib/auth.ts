import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE = 'admin_session';
const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? 'dev-insecure-secret-change-me');

export type SessionPayload = { sub: string; email: string; name: string };

/** Подписать JWT-сессию (7 дней). */
export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

/** Проверить токен. Возвращает payload или null. Работает в Edge (middleware). */
export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { sub: String(payload.sub), email: String(payload.email), name: String(payload.name) };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE;

/** Прочитать текущую сессию из cookies (server components / route handlers). */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE)?.value;
  return verifySession(token);
}

export function sessionCookieOptions() {
  return {
    name: COOKIE,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}
