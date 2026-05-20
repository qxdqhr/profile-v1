import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import type { User } from 'sa2kit/auth/legacy';

const ADMIN_ROLES = new Set(['admin', 'super_admin']);

export function isAdminUser(user: User | null): boolean {
  if (!user) return false;
  return ADMIN_ROLES.has(String(user.role));
}

/** 已登录即可 */
export async function requireAuth(
  request: NextRequest,
): Promise<User | NextResponse> {
  const user = await validateApiAuth(request);
  if (!user) {
    return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
  }
  return user;
}

/** 管理员（admin / super_admin） */
export async function requireAdmin(
  request: NextRequest,
): Promise<User | NextResponse> {
  const user = await validateApiAuth(request);
  if (!user) {
    return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
  }
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
  }
  return user;
}

export function isAuthFailure(
  result: User | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
