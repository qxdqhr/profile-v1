import { NextResponse } from 'next/server';
import { getHomePageConfig } from '@/modules/Home/server/homePageConfigService';
import { stripContactConfig } from '@/modules/Home/server/homePageConfigSecrets';

export async function GET() {
  try {
    const config = stripContactConfig(await getHomePageConfig());
    return NextResponse.json(config);
  } catch (error) {
    console.error('[homePage][GET] failed:', error);
    return NextResponse.json(
      { error: '获取首页配置失败' },
      { status: 500 },
    );
  }
}
