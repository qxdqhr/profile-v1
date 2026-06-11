import { NextRequest, NextResponse } from 'next/server';
import { readBusinessConfig, writeBusinessConfig } from '@/lib/config/business-config';
import {
  buildPersistedConfig,
  DEFAULT_HUARONGDAO_PERSISTED_CONFIG,
} from '@/modules/testField/huarongdao/shared';

export async function GET() {
  try {
    const business = readBusinessConfig();
    const data = business.huarongdao
      ? buildPersistedConfig(business.huarongdao)
      : DEFAULT_HUARONGDAO_PERSISTED_CONFIG;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[huarongdao/config][GET] failed:', error);
    return NextResponse.json(
      { success: false, error: '获取华容道配置失败' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const normalized = buildPersistedConfig(body);

    writeBusinessConfig((business) => ({
      ...business,
      huarongdao: normalized,
    }));

    return NextResponse.json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    console.error('[huarongdao/config][PUT] failed:', error);
    return NextResponse.json(
      { success: false, error: '保存华容道配置失败' },
      { status: 500 },
    );
  }
}
