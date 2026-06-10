/**
 * 测试配置 API
 * Test Configuration API
 * 
 * GET /api/test-configs - 获取所有配置
 * POST /api/test-configs - 创建新配置
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConfigService } from '@/lib/examples/test-config-service';
import type { SavedConfig } from 'sa2kit/testYourself';

/**
 * 获取配置列表
 * GET /api/test-configs
 */
export async function GET(request: NextRequest) {
  try {
    // 获取用户ID（从请求头或使用默认值）
    const userId = request.headers.get('x-user-id') || 'example-user';

    // 获取配置服务
    const { configService, storageType } = getConfigService(userId);
    
    // 初始化服务（如果需要）
    if (typeof configService.init === 'function') {
      await configService.init();
    }

    // 获取所有配置
    const configs = await configService.getAllConfigs();

    return NextResponse.json({
      success: true,
      configs,
      total: configs.length,
      storageType,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 获取配置列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取配置列表失败',
      },
      { status: 500 }
    );
  }
}

/**
 * 创建配置
 * POST /api/test-configs
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'example-user';
    const body = await request.json();

    // 验证必需字段
    if (!body.name || !body.config) {
      return NextResponse.json(
        { success: false, error: '缺少必需字段: name, config' },
        { status: 400 }
      );
    }

    // 获取配置服务
    const { configService } = getConfigService(userId);
    
    // 初始化服务（如果需要）
    if (typeof configService.init === 'function') {
      await configService.init();
    }

    // 创建配置（支持自定义 ID）
    const savedConfig: SavedConfig = {
      id: body.id || crypto.randomUUID(),  // 允许自定义 ID
      name: body.name,
      description: body.description,
      config: body.config,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDefault: body.isDefault || false,
    };

    await configService.saveConfig(savedConfig);

    console.log('✅ 配置已创建:', savedConfig.id);

    return NextResponse.json({
      success: true,
      config: savedConfig,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 创建配置失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '创建配置失败',
      },
      { status: 500 }
    );
  }
}










