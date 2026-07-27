import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/app/lib/auth';

// Защита раздела /admin (кроме страницы логина). Проверка JWT-сессии в Edge.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin/login')) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) {
    // Относительный Location — браузер подставит текущий домен сам. Это надёжно
    // за обратным прокси (Caddy), где абсолютный URL из req.nextUrl уводит на
    // внутренний localhost:3020.
    const location = `/admin/login?from=${encodeURIComponent(pathname)}`;
    return new NextResponse(null, { status: 307, headers: { Location: location } });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
