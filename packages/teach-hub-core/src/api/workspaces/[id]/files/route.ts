import { NextRequest } from 'next/server';
import { listWorkspaceFiles } from '../../../../services/teachHubFileStore';
import { jsonError, jsonOk, parseWorkspaceId, requireUser, requireWorkspace } from '../../../_helpers';

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
    const files = await listWorkspaceFiles(auth.user.id, workspaceId);
    return jsonOk({
      files: files.map((f) => ({
        relativePath: f.relativePath,
        mimeType: f.mimeType,
        size: f.size,
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    console.error('[teach-hub/workspaces/:id/files GET]', error);
    return jsonError('列出工作区文件失败', 500);
  }
}
