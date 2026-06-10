import { NextRequest } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { listOpenAiCompatibleModels } from '../../server/listModels';
import type { AiModelsListRequest, AiModelsListResponse } from '../../types/models';

/**
 * 获取 OpenAI 兼容 API 的可用模型列表
 * POST /api/ai/models
 * Body: { clientSettings? }
 */
export async function POST(request: NextRequest) {
  const user = await getApiSessionUser(request);
  if (!user) {
    return Response.json(
      {
        success: false,
        models: [],
        visionModels: [],
        error: { code: 'UNAUTHORIZED', message: '未授权访问' },
      } satisfies AiModelsListResponse,
      { status: 401 }
    );
  }

  let body: AiModelsListRequest = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const result = await listOpenAiCompatibleModels(
      body.clientSettings,
      body.clientSettings?.visionModel
    );

    return Response.json({
      success: true,
      models: result.models,
      visionModels: result.visionModels,
      suggestedVisionModel: result.suggestedVisionModel,
    } satisfies AiModelsListResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : '获取模型列表失败';
    const isConfigMissing = message.includes('未配置 AI API Key');

    return Response.json(
      {
        success: false,
        models: [],
        visionModels: [],
        error: {
          code: isConfigMissing ? 'AI_CONFIG_MISSING' : 'AI_REQUEST_FAILED',
          message,
        },
      } satisfies AiModelsListResponse,
      { status: isConfigMissing ? 503 : 400 }
    );
  }
}
