import { NextResponse } from 'next/server';
import { getApiSessionUser } from '@profile/auth/session';

export async function requireAuthUser(request: Request) {
  const user = await getApiSessionUser(request);
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 }),
    };
  }
  return { user, response: null };
}

export function ok<T>(data: T) {
  return NextResponse.json({ success: true, data });
}

export function fail(message: string, status = 500) {
  return NextResponse.json({ success: false, message }, { status });
}
