import { NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';

export async function requireAuthUser(request: Request) {
  const user = await validateApiAuth(request);
  if (!user) {
    return { user: null, response: NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 }) };
  }
  return { user, response: null };
}

export function ok<T>(data: T) {
  return NextResponse.json({ success: true, data });
}

export function fail(message: string, status = 500) {
  return NextResponse.json({ success: false, message }, { status });
}
