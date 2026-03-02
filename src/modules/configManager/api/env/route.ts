import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { envConfigService } from '../../services/envConfigService';

/**
 * 环境变量管理API
 * 
 * GET /api/configManager/env - 获取当前环境变量配置
 * POST /api/configManager/env/load - 从数据库加载并应用环境变量
 * POST /api/configManager/env/refresh - 刷新环境变量缓存
 * GET /api/configManager/env/stats - 获取配置统计信息
 * GET /api/configManager/env/validate - 验证必需配置项
 */

// 获取当前环境变量配置
export async function GET(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        // 获取配置统计信息
        const stats = await envConfigService.getConfigStats();
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'validate':
        // 验证必需配置项
        const validation = await envConfigService.validateRequiredConfig();
        return NextResponse.json({
          success: true,
          data: validation
        });

      default:
        // 获取当前缓存的环境变量配置
        const cachedConfig = envConfigService.getCachedConfig();
        return NextResponse.json({
          success: true,
          data: {
            config: cachedConfig,
            total: Object.keys(cachedConfig).length,
            timestamp: new Date().toISOString()
          }
        });
    }

  } catch (error) {
    console.error('❌ [环境变量API] 获取配置失败:', error);
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    );
  }
}

// 加载和应用环境变量
export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'load':
        // 从数据库加载并应用环境变量
        console.log('🔄 [环境变量API] 开始加载环境变量...');
        const envConfig = await envConfigService.loadConfigFromDatabase();
        envConfigService.setEnvironmentVariables(envConfig);
        
        return NextResponse.json({
          success: true,
          data: {
            message: '环境变量加载成功',
            totalLoaded: Object.keys(envConfig).length,
            config: envConfig
          }
        });

      case 'refresh':
        // 刷新环境变量缓存
        console.log('🔄 [环境变量API] 开始刷新缓存...');
        await envConfigService.refreshCache();
        
        return NextResponse.json({
          success: true,
          data: {
            message: '缓存刷新成功',
            timestamp: new Date().toISOString()
          }
        });

      case 'update':
        // 更新单个配置项
        const { key, value } = await request.json();
        if (!key || value === undefined) {
          return NextResponse.json(
            { error: '缺少必要的参数' },
            { status: 400 }
          );
        }

        await envConfigService.updateConfigAndRefresh(key, value);
        
        return NextResponse.json({
          success: true,
          data: {
            message: '配置更新成功',
            key,
            value: envConfigService.maskSensitiveValue(key, value)
          }
        });

      case 'batch-update':
        // 批量更新配置项
        const { updates } = await request.json();
        if (!Array.isArray(updates)) {
          return NextResponse.json(
            { error: 'updates参数必须是数组' },
            { status: 400 }
          );
        }

        await envConfigService.batchUpdateConfigAndRefresh(updates);
        
        return NextResponse.json({
          success: true,
          data: {
            message: '批量更新成功',
            updatedCount: updates.length
          }
        });

      default:
        return NextResponse.json(
          { error: '无效的操作' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ [环境变量API] 操作失败:', error);
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    );
  }
} 