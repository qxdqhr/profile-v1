import { NextResponse } from 'next/server';
import { ensureAppConfigLoaded } from '@/lib/config/init';

export async function GET() {
  const config = ensureAppConfigLoaded();

  return NextResponse.json({
    success: true,
    data: {
      source: 'config/app.config.*.yaml',
      app: config.app.name,
      database: config.database.url ? '已设置' : '未设置',
      auth: {
        url: config.auth.url,
        publicUrl: config.auth.publicUrl,
        smsProvider: config.auth.sms?.provider ?? '未设置',
      },
      storage: {
        ossEnabled: config.storage?.aliyunOss?.enabled !== false && Boolean(config.storage?.aliyunOss?.accessKeyId),
        bucket: config.storage?.aliyunOss?.bucket ?? null,
      },
    },
  });
}
