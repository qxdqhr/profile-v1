import { NextRequest } from 'next/server';
import {
  createWorkspace,
  listWorkspacesByUser,
} from '@/modules/teachHub/services/teachHubDbService';
import type { CreateWorkspaceInput } from '@/modules/teachHub/types';
import { jsonError, jsonOk, requireUser } from '@/modules/teachHub/api/_helpers';

export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;

  try {
    const status = new URL(request.url).searchParams.get('status');
    let items = await listWorkspacesByUser(auth.user.id);
    if (status === 'active' || status === 'archived') {
      items = items.filter((w) => w.status === status);
    }
    return jsonOk({ items });
  } catch (error) {
    console.error('[teach-hub/workspaces GET]', error);
    return jsonError('获取工作区列表失败', 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;

  try {
    const body = (await request.json()) as CreateWorkspaceInput;
    const title = body.title?.trim();
    if (!title) {
      return jsonError('title 不能为空');
    }

    const workspace = await createWorkspace(auth.user.id, {
      title,
      topic: body.topic,
      missionDraft: body.missionDraft,
    });

    return jsonOk(workspace, 201);
  } catch (error) {
    console.error('[teach-hub/workspaces POST]', error);
    const message =
      error instanceof Error ? error.message : '创建工作区失败';
    return jsonError(message.includes('文件存储') ? message : `创建工作区失败：${message}`, 500);
  }
}
