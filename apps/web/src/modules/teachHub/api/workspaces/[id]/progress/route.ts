import { NextRequest } from 'next/server';
import {
  ensureLessonProgressRows,
  upsertLessonProgress,
} from '@/modules/teachHub/services/teachHubDbService';
import type { LessonProgressStatus, UpdateProgressInput } from '@/modules/teachHub/types';
import { jsonError, jsonOk, parseWorkspaceId, requireUser, requireWorkspace } from '@/modules/teachHub/api/_helpers';

type RouteContext = { params: Promise<{ id: string }> };

const ALLOWED_STATUS: LessonProgressStatus[] = [
  'locked',
  'available',
  'in_progress',
  'completed',
];

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;

  const { id: rawId } = await context.params;
  const workspaceId = parseWorkspaceId(rawId);
  if (!workspaceId) return jsonError('非法 workspace id');

  const owned = await requireWorkspace(auth.user.id, workspaceId);
  if ('response' in owned) return owned.response;

  try {
    const items = await ensureLessonProgressRows(auth.user.id, workspaceId);
    return jsonOk({ items });
  } catch (error) {
    console.error('[teach-hub/workspaces/:id/progress GET]', error);
    return jsonError('获取学习进度失败', 500);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;

  const { id: rawId } = await context.params;
  const workspaceId = parseWorkspaceId(rawId);
  if (!workspaceId) return jsonError('非法 workspace id');

  const owned = await requireWorkspace(auth.user.id, workspaceId);
  if ('response' in owned) return owned.response;

  try {
    const body = (await request.json()) as UpdateProgressInput;
    if (!body.lessonSlug?.trim()) {
      return jsonError('lessonSlug 不能为空');
    }
    if (!ALLOWED_STATUS.includes(body.status)) {
      return jsonError('非法 status');
    }

    const item = await upsertLessonProgress(auth.user.id, workspaceId, {
      lessonSlug: body.lessonSlug.trim(),
      status: body.status,
      quizScore: body.quizScore,
      quizTotal: body.quizTotal,
    });

    return jsonOk(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新进度失败';
    console.error('[teach-hub/workspaces/:id/progress POST]', error);
    return jsonError(message, message.includes('不存在') ? 404 : 500);
  }
}
