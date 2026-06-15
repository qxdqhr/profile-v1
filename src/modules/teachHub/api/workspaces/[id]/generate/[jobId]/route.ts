import { NextRequest } from 'next/server';
import { getGenerateJobForUser } from '@/modules/teachHub/services/generateLessonService';
import { jsonError, jsonOk, parseWorkspaceId, requireUser, requireWorkspace } from '@/modules/teachHub/api/_helpers';

type RouteContext = { params: Promise<{ id: string; jobId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;

  const { id: rawId, jobId } = await context.params;
  const workspaceId = parseWorkspaceId(rawId);
  if (!workspaceId) return jsonError('非法 workspace id');

  const owned = await requireWorkspace(auth.user.id, workspaceId);
  if ('response' in owned) return owned.response;

  try {
    const job = await getGenerateJobForUser(auth.user.id, workspaceId, jobId);
    if (!job) return jsonError('任务不存在', 404);
    return jsonOk(job);
  } catch (error) {
    console.error('[teach-hub/generate/:jobId GET]', error);
    return jsonError('获取任务失败', 500);
  }
}
