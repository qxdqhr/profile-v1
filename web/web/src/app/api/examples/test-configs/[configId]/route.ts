/**
 * 单个配置操作 API
 * Single Configuration API
 * 
 * GET /api/test-configs/:configId - 获取配置
 * PUT /api/test-configs/:configId - 更新配置
 * DELETE /api/test-configs/:configId - 删除配置
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConfigService } from '@/lib/examples/test-config-service';

/**
 * 获取单个配置
 * GET /api/test-configs/:configId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ configId: string }> }
) {
  try {
    const { configId } = await params;
    const userId = request.headers.get('x-user-id') || 'example-user';

    const { configService } = getConfigService(userId);
    
    if (typeof configService.init === 'function') {
      await configService.init();
    }

    const config = await configService.getConfig(configId);

    if (!config) {
      return NextResponse.json(
        { success: false, error: '配置不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 获取配置失败:', error);
    return NextResponse.json(
      { success: false, error: '获取配置失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新配置
 * PUT /api/test-configs/:configId
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ configId: string }> }
) {
  try {
    const { configId } = await params;
    const userId = request.headers.get('x-user-id') || 'example-user';
    const body = await request.json();

    const { configService } = getConfigService(userId);
    
    if (typeof configService.init === 'function') {
      await configService.init();
    }

    // 获取现有配置
    const existing = await configService.getConfig(configId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '配置不存在' },
        { status: 404 }
      );
    }

    // 更新配置
    const updatedConfig = {
      ...existing,
      ...body,
      id: configId, // 保持ID不变
      updatedAt: Date.now(),
    };

    await configService.updateConfig(configId, updatedConfig);

    console.log('✅ 配置已更新:', configId);

    return NextResponse.json({
      success: true,
      config: updatedConfig,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 更新配置失败:', error);
    return NextResponse.json(
      { success: false, error: '更新配置失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除配置
 * DELETE /api/test-configs/:configId
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ configId: string }> }
) {
  try {
    const { configId } = await params;
    const userId = request.headers.get('x-user-id') || 'example-user';

    const { configService } = getConfigService(userId);
    
    if (typeof configService.init === 'function') {
      await configService.init();
    }

    await configService.deleteConfig(configId);

    console.log('🗑️ 配置已删除:', configId);

    return NextResponse.json({
      success: true,
      message: '配置已删除',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 删除配置失败:', error);
    return NextResponse.json(
      { success: false, error: '删除配置失败' },
      { status: 500 }
    );
  }
}



