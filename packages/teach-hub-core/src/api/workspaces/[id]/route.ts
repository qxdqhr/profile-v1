import { NextRequest } from 'next/server';
import {
  archiveWorkspace,
  ensureLessonProgressRows,
  getWorkspaceForUser,
  syncWorkspaceLessonCache,
  touchWorkspaceOpened,
  updateWorkspaceMeta,
} from '../../../services/teachHubDbService';
import {
  listWorkspaceLessons,
  repairWorkspaceSeedFilesIfMissing,
} from '../../../services/teachHubFileStore';
import type { WorkspaceStatus } from '../../../types';
import { jsonError, jsonOk, parseWorkspaceId, requireUser, requireWorkspace } from '../../_helpers';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;

  const { id: rawId } = await context.params;
  const workspaceId = parseWorkspaceId(rawId);
  if (!workspaceId) return jsonError('非法 workspace id');

  const owned = await requireWorkspace(auth.user.id, workspaceId);
  if ('response' in owned) return owned.response;

  try {
    await touchWorkspaceOpened(auth.user.id, workspaceId);
    let workspace = await getWorkspaceForUser(auth.user.id, workspaceId);
    if (workspace) {
      await repairWorkspaceSeedFilesIfMissing(auth.user.id, workspace);
      workspace = await getWorkspaceForUser(auth.user.id, workspaceId);
    }
    await syncWorkspaceLessonCache(auth.user.id, workspaceId);
    const lessons = await listWorkspaceLessons(auth.user.id, workspaceId);
    const progress = await ensureLessonProgressRows(auth.user.id, workspaceId);

    return jsonOk({
      workspace,
      lessons,
      progress,
    });
  } catch (error) {
    console.error('[teach-hub/workspaces/:id GET]', error);
    return jsonError('获取工作区详情失败', 500);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;

  const { id: rawId } = await context.params;
  const workspaceId = parseWorkspaceId(rawId);
  if (!workspaceId) return jsonError('非法 workspace id');

  const owned = await requireWorkspace(auth.user.id, workspaceId);
  if ('response' in owned) return owned.response;

  try {
    const body = (await request.json()) as {
      title?: string;
      status?: WorkspaceStatus;
      missionSummary?: string | null;
    };

    const patch: {
      title?: string;
      status?: WorkspaceStatus;
      missionSummary?: string | null;
    } = {};

    if (body.title?.trim()) patch.title = body.title.trim();
    if (body.status === 'active' || body.status === 'archived') patch.status = body.status;
    if (body.missionSummary !== undefined) patch.missionSummary = body.missionSummary;

    const workspace = await updateWorkspaceMeta(auth.user.id, workspaceId, patch);
    return jsonOk(workspace);
  } catch (error) {
    console.error('[teach-hub/workspaces/:id PATCH]', error);
    return jsonError('更新工作区失败', 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;

  const { id: rawId } = await context.params;
  const workspaceId = parseWorkspaceId(rawId);
  if (!workspaceId) return jsonError('非法 workspace id');

  const owned = await requireWorkspace(auth.user.id, workspaceId);
  if ('response' in owned) return owned.response;

  try {
    const workspace = await archiveWorkspace(auth.user.id, workspaceId);
    return jsonOk(workspace);
  } catch (error) {
    console.error('[teach-hub/workspaces/:id DELETE]', error);
    return jsonError('归档工作区失败', 500);
  }
}
