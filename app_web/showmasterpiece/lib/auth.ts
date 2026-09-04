import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser, isAdminRole, type SessionUser } from '@profile/auth/session';

export function isAdminUser(user: SessionUser | null): boolean {
  return isAdminRole(user?.role);
}

/** 已登录即可 */
export async function requireAuth(
  request: NextRequest,
): Promise<SessionUser | NextResponse> {
  const user = await getApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
  }
  return user;
}

/** 管理员（admin / super_admin） */
export async function requireAdmin(
  request: NextRequest,
): Promise<SessionUser | NextResponse> {
  const user = await getApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
  }
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
  }
  return user;
}

export function isAuthFailure(
  result: SessionUser | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
