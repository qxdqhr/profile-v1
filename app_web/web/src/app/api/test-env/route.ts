import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/api-guard';
import { ensureAppConfigLoaded } from '@/lib/config/init';

export async function GET(request: NextRequest) {
  const gated = await requireAdminSession(request);
  if (gated.error) return gated.error;

  const config = ensureAppConfigLoaded();

  return NextResponse.json({
    success: true,
    data: {
      source: 'config/app.config.*.yaml',
      app: config.app.name,
      database: config.database.url ? '已设置' : '未设置',
      auth: {
        publicUrlSet: Boolean(config.auth.publicUrl),
        smsProvider: config.auth.sms?.provider ?? '未设置',
      },
      storage: {
        ossEnabled: config.storage?.aliyunOss?.enabled !== false && Boolean(config.storage?.aliyunOss?.accessKeyId),
        bucketSet: Boolean(config.storage?.aliyunOss?.bucket),
      },
    },
  });
}
