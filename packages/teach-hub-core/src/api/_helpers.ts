import { NextResponse } from 'next/server';
import { getApiSessionUser } from '@profile/auth/session';
import type { SessionUser } from '@profile/auth/session';
import { assertWorkspaceForUser } from '../services/teachHubDbService';
import type { TeachWorkspace } from '../types';
import { assertSafeId } from '../utils/teachWorkspacePaths';

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function requireUser(
  request: Request,
): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const user = await getApiSessionUser(request);
  if (!user) {
    return { response: jsonError('未授权访问', 401) };
  }
  return { user };
}

export function parseWorkspaceId(raw: string): string | null {
  const id = raw.trim();
  if (!id) return null;
  try {
    assertSafeId(id, 'workspaceId');
    return id;
  } catch {
    return null;
  }
}

export async function requireWorkspace(
  userId: string,
  workspaceId: string,
): Promise<{ workspace: TeachWorkspace } | { response: NextResponse }> {
  try {
    const workspace = await assertWorkspaceForUser(userId, workspaceId);
    return { workspace };
  } catch {
    return { response: jsonError('工作区不存在或无权访问', 403) };
  }
}
