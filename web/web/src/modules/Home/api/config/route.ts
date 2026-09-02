import { NextRequest, NextResponse } from 'next/server';
import { isAuthFailure, requireAuth } from '../lib/auth';
import {
  getHomePageConfig,
  saveHomePageConfig,
} from '../../server/homePageConfigService';
import { maskHomePageConfigForAdmin } from '../../server/homePageConfigSecrets';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthFailure(authResult)) return authResult;

  try {
    const data = await getHomePageConfig();
    return NextResponse.json({
      success: true,
      data: maskHomePageConfigForAdmin(data),
    });
  } catch (error) {
    console.error('[homePage/config][GET] failed:', error);
    return NextResponse.json(
      { success: false, error: '获取首页配置失败' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthFailure(authResult)) return authResult;

  try {
    const body = await request.json();
    const data = await saveHomePageConfig(body);
    return NextResponse.json({
      success: true,
      data: maskHomePageConfigForAdmin(data),
    });
  } catch (error) {
    console.error('[homePage/config][PUT] failed:', error);
    const message = error instanceof Error ? error.message : '保存首页配置失败';
    const status = message.includes('https://') ? 400 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status },
    );
  }
}
