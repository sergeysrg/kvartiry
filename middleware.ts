import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/app/lib/auth';

// Защита раздела /admin (кроме страницы логина). Проверка JWT-сессии в Edge.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin/login')) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) {
    // База — публичный домен из NEXT_PUBLIC_SITE_URL. За обратным прокси (Caddy)
    // req.nextUrl.origin = внутренний localhost:3020, поэтому используем его.
    const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || req.nextUrl.origin;
    const url = new URL(`/admin/login?from=${encodeURIComponent(pathname)}`, base);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
