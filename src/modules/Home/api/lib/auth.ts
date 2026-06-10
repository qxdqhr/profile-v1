import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import type { SessionUser } from '@/lib/auth/session';

export async function requireAuth(
  request: NextRequest,
): Promise<SessionUser | NextResponse> {
  const user = await getApiSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: '未授权的访问，请先登录' },
      { status: 401 },
    );
  }
  return user;
}

export function isAuthFailure(
  result: SessionUser | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}

export function isMaskedValue(value: string | null | undefined): boolean {
  return Boolean(value && value.includes('****'));
}
