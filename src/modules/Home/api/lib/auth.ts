import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import type { User } from 'sa2kit/auth/legacy';

export async function requireAuth(
  request: NextRequest,
): Promise<User | NextResponse> {
  const user = await validateApiAuth(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: '未授权的访问，请先登录' },
      { status: 401 },
    );
  }
  return user;
}

export function isAuthFailure(
  result: User | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}

export function isMaskedValue(value: string | null | undefined): boolean {
  return Boolean(value && value.includes('****'));
}
