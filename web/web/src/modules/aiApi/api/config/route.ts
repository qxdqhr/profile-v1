import { NextRequest } from 'next/server';
import { resolveAiConnectionConfig } from 'sa2kit/common/aiApi/server';
import type { AiServerConfigStatus } from 'sa2kit/common/aiApi';
import { ensureAppConfigLoaded } from '@/lib/config/init';
import { getApiSessionUser } from '@/lib/auth/session';

/**
 * 查询服务端是否已配置 AI（不暴露 apiKey）
 * GET /api/ai/config
 */
export async function GET(request: NextRequest) {
  const user = await getApiSessionUser(request);
  if (!user) {
    return Response.json(
      { serverConfigured: false, error: '未授权访问' },
      { status: 401 }
    );
  }

  ensureAppConfigLoaded();
  const config = resolveAiConnectionConfig();

  const status: AiServerConfigStatus = {
    serverConfigured: Boolean(config),
    baseUrl: config?.baseUrl,
    visionModel: config?.visionModel,
    textModel: config?.textModel,
  };

  return Response.json(status);
}
