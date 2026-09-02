import { NextResponse } from 'next/server';
import { getApiSessionUser, isAdminRole, type SessionUser } from './session';

export function unauthorizedJson(message = '未授权访问') {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

export function forbiddenJson(message = '需要管理员权限') {
  return NextResponse.json({ success: false, message }, { status: 403 });
}

export function notFoundJson() {
  return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
}

export async function requireApiSession(
  request: Request,
): Promise<{ user: SessionUser; error?: undefined } | { user?: undefined; error: NextResponse }> {
  const user = await getApiSessionUser(request);
  if (!user) return { error: unauthorizedJson() };
  return { user };
}

export async function requireAdminSession(
  request: Request,
): Promise<{ user: SessionUser; error?: undefined } | { user?: undefined; error: NextResponse }> {
  const gated = await requireApiSession(request);
  if (gated.error) return gated;
  if (!isAdminRole(gated.user.role)) return { error: forbiddenJson() };
  return { user: gated.user };
}
