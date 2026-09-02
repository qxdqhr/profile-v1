/**
 * 默认配置 API
 * Default Configuration API
 * 
 * GET /api/test-configs/default - 获取默认配置
 * POST /api/test-configs/default - 设置默认配置
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConfigService } from '@/lib/examples/test-config-service';

/**
 * 获取默认配置
 * GET /api/test-configs/default
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'example-user';

    const { configService } = getConfigService(userId);
    
    if (typeof configService.init === 'function') {
      await configService.init();
    }

    const defaultConfig = await configService.getDefaultConfig();

    if (!defaultConfig) {
      return NextResponse.json(
        { success: false, error: '未设置默认配置' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      config: defaultConfig,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 获取默认配置失败:', error);
    return NextResponse.json(
      { success: false, error: '获取默认配置失败' },
      { status: 500 }
    );
  }
}

/**
 * 设置默认配置
 * POST /api/test-configs/default
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'example-user';
    const body = await request.json();

    if (!body.configId) {
      return NextResponse.json(
        { success: false, error: '缺少 configId 参数' },
        { status: 400 }
      );
    }

    const { configService } = getConfigService(userId);
    
    if (typeof configService.init === 'function') {
      await configService.init();
    }

    await configService.setDefaultConfig(body.configId);

    console.log('✅ 默认配置已设置:', body.configId);

    return NextResponse.json({
      success: true,
      message: '默认配置已设置',
      configId: body.configId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 设置默认配置失败:', error);
    return NextResponse.json(
      { success: false, error: '设置默认配置失败' },
      { status: 500 }
    );
  }
}










