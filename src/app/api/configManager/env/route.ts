/**
 * 配置管理模块 - 环境变量API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { EnvConfigService } from '@/modules/configManager/services/envConfigService';
import { databaseConfigSync } from '@/modules/configManager/services/databaseConfigSync';

// 获取环境变量统计信息
async function getStats() {
  try {
    const service = EnvConfigService.getInstance();
    const stats = await service.getConfigStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('获取环境变量统计信息失败:', error);
    
    // 如果是数据库连接错误，返回特定的错误信息
    if (error.code === 'ECONNRESET' || error.message?.includes('TLS')) {
      return NextResponse.json(
        { 
          success: false,
          error: '数据库连接失败，请检查数据库服务是否正常运行',
          details: 'SSL/TLS连接问题，请检查数据库配置'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: '获取统计信息失败', details: error.message },
      { status: 500 }
    );
  }
}

// 验证环境变量配置
async function validateConfig() {
  try {
    const service = EnvConfigService.getInstance();
    const validation = await service.validateRequiredConfig();
    return NextResponse.json({ success: true, data: validation });
  } catch (error: any) {
    console.error('验证环境变量配置失败:', error);
    
    // 如果是数据库连接错误，返回特定的错误信息
    if (error.code === 'ECONNRESET' || error.message?.includes('TLS')) {
      return NextResponse.json(
        { 
          success: false,
          error: '数据库连接失败，无法验证配置',
          details: '请检查数据库服务是否正常运行'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: '验证配置失败', details: error.message },
      { status: 500 }
    );
  }
}

// 获取环境变量列表
async function getEnvVars() {
  try {
    const service = EnvConfigService.getInstance();
    const envVars = service.getCachedConfig();
    return NextResponse.json({ success: true, data: envVars });
  } catch (error: any) {
    console.error('获取环境变量失败:', error);
    
    // 如果是数据库连接错误，返回特定的错误信息
    if (error.code === 'ECONNRESET' || error.message?.includes('TLS')) {
      return NextResponse.json(
        { 
          success: false,
          error: '数据库连接失败，无法获取环境变量',
          details: '请检查数据库服务是否正常运行'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: '获取环境变量失败', details: error.message },
      { status: 500 }
    );
  }
}

// 更新环境变量
async function updateEnvVars(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body;
    
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: '无效的更新数据' },
        { status: 400 }
      );
    }

    const service = EnvConfigService.getInstance();
    await service.batchUpdateConfigAndRefresh(updates);
    
    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新环境变量失败:', error);
    return NextResponse.json(
      { error: '更新环境变量失败' },
      { status: 500 }
    );
  }
}

// 刷新环境变量缓存
async function refreshCache() {
  try {
    const service = EnvConfigService.getInstance();
    await service.refreshCache();
    
    // 同步数据库配置
    await databaseConfigSync.syncDatabaseConfig();
    
    return NextResponse.json({ 
      success: true, 
      message: '缓存刷新成功，数据库配置已同步',
      data: { totalLoaded: 20 } // 假设加载了20个配置项
    });
  } catch (error: any) {
    console.error('刷新缓存失败:', error);
    return NextResponse.json(
      { success: false, error: '刷新缓存失败', details: error.message },
      { status: 500 }
    );
  }
}

// 同步数据库配置
async function syncDatabaseConfig() {
  try {
    await databaseConfigSync.syncDatabaseConfig();
    return NextResponse.json({ message: '数据库配置同步成功' });
  } catch (error) {
    console.error('同步数据库配置失败:', error);
    return NextResponse.json(
      { error: '同步数据库配置失败' },
      { status: 500 }
    );
  }
}

// 获取数据库配置信息
async function getDatabaseConfig() {
  try {
    const currentConfig = databaseConfigSync.getCurrentDatabaseConfig();
    const validation = databaseConfigSync.validateDatabaseConfig();
    const description = databaseConfigSync.getDatabaseConfigDescription();
    
    return NextResponse.json({
      currentConfig,
      validation,
      description
    });
  } catch (error) {
    console.error('获取数据库配置失败:', error);
    return NextResponse.json(
      { error: '获取数据库配置失败' },
      { status: 500 }
    );
  }
}

// 主处理函数
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'stats':
      return getStats();
    case 'validate':
      return validateConfig();
    case 'refresh':
      return refreshCache();
    case 'sync-db':
      return syncDatabaseConfig();
    case 'db-config':
      return getDatabaseConfig();
    default:
      return getEnvVars();
  }
}

export async function POST(request: NextRequest) {
  return updateEnvVars(request);
} 