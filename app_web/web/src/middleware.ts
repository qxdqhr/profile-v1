import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isNodeProduction } from '@/lib/runtime/is-node-production';
import {
  hasSessionCookie,
  isPublicApi,
  isSessionCookieName,
} from '@/lib/auth/public-api';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (pathname.startsWith('/api/examples') && isNodeProduction()) {
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  }

  if (method === 'OPTIONS') {
    return NextResponse.next();
  }

  if (isPublicApi(pathname, method)) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get('cookie');
  if (
    request.cookies.getAll().some((cookie) => isSessionCookieName(cookie.name)) ||
    hasSessionCookie(cookieHeader)
  ) {
    return NextResponse.next();
  }

  return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
}

export const config = {
  matcher: ['/api/:path*'],
};
