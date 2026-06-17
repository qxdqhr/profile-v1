import { NextRequest } from 'next/server';
import { getApiSessionUser } from '@profile/auth/session';
import { ensureAppConfigLoaded } from '@profile/config';
import { resolveAiConnectionConfig } from 'sa2kit/common/aiApi/server';
import type { AiServerConfigStatus } from 'sa2kit/common/aiApi';

export async function GET(request: NextRequest) {
  const user = await getApiSessionUser(request);
  if (!user) {
    return Response.json({ serverConfigured: false, error: '未授权访问' }, { status: 401 });
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
