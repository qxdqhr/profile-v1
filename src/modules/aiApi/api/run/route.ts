import { NextRequest } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { registerCoreAiTasks } from '../../server/registerCoreTasks';
import { runAiTask } from '../../server/runTask';
import type { AiApiRunRequest } from '../types';

registerCoreAiTasks();

/**
 * 统一 AI 任务入口
 * POST /api/ai/run
 * Body: { taskId, input, options? }
 */
export async function POST(request: NextRequest) {
  const user = await validateApiAuth(request);
  if (!user) {
    return Response.json(
      {
        success: false,
        taskId: '',
        error: { code: 'UNAUTHORIZED', message: '未授权访问' },
      },
      { status: 401 }
    );
  }

  let body: AiApiRunRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        taskId: '',
        error: { code: 'INVALID_INPUT', message: '请求体必须是 JSON' },
      },
      { status: 400 }
    );
  }

  if (!body?.taskId || typeof body.taskId !== 'string') {
    return Response.json(
      {
        success: false,
        taskId: '',
        error: { code: 'INVALID_INPUT', message: 'taskId 为必填字符串' },
      },
      { status: 400 }
    );
  }

  const requestId = crypto.randomUUID();
  const result = await runAiTask(body.taskId, body.input, {
    userId: user.id,
    requestId,
    clientSettings: body.clientSettings,
  });

  const status = result.success
    ? 200
    : result.error?.code === 'UNAUTHORIZED'
      ? 401
      : result.error?.code === 'TASK_NOT_FOUND'
        ? 404
        : result.error?.code === 'AI_CONFIG_MISSING'
          ? 503
          : 400;

  return Response.json(result, { status });
}
