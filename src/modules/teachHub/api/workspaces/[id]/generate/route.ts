import { NextRequest } from 'next/server';
import {
  checkGeneratePreconditions,
  listGenerateJobsForUser,
  runGenerateLesson,
} from '@/modules/teachHub/services/generateLessonService';
import { jsonError, jsonOk, parseWorkspaceId, requireUser, requireWorkspace } from '@/modules/teachHub/api/_helpers';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;

  const { id: rawId } = await context.params;
  const workspaceId = parseWorkspaceId(rawId);
  if (!workspaceId) return jsonError('非法 workspace id');

  const owned = await requireWorkspace(auth.user.id, workspaceId);
  if ('response' in owned) return owned.response;

  try {
    const body = (await request.json()) as { trigger?: 'first_lesson' | 'next_lesson' };
    const trigger = body.trigger;
    if (trigger !== 'first_lesson' && trigger !== 'next_lesson') {
      return jsonError('trigger 必须为 first_lesson 或 next_lesson');
    }

    const pre = await checkGeneratePreconditions(auth.user.id, workspaceId, trigger);
    if (!pre.ok) {
      return jsonError(pre.reason, 400);
    }

    const job = await runGenerateLesson({
      userId: auth.user.id,
      workspaceId,
      trigger,
    });

    if (job.status === 'failed') {
      return jsonError(job.errorMessage || '生成失败', 500);
    }

    return jsonOk(job, 201);
  } catch (error) {
    console.error('[teach-hub/generate POST]', error);
    return jsonError(error instanceof Error ? error.message : '生成失败', 500);
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;

  const { id: rawId } = await context.params;
  const workspaceId = parseWorkspaceId(rawId);
  if (!workspaceId) return jsonError('非法 workspace id');

  const owned = await requireWorkspace(auth.user.id, workspaceId);
  if ('response' in owned) return owned.response;

  try {
    const items = await listGenerateJobsForUser(auth.user.id, workspaceId);
    return jsonOk({ items });
  } catch (error) {
    console.error('[teach-hub/generate GET]', error);
    return jsonError('获取生成记录失败', 500);
  }
}
