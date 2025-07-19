/**
 * 配置管理模块 - 配置项API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { configDbService } from '@/modules/configManager/db/configDbService';

// 获取配置项列表
async function getConfigItems(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const type = searchParams.get('type') as any;
    const isActive = searchParams.get('isActive') !== 'false';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const environment = searchParams.get('environment') || 'development';

    console.log(`获取 ${environment} 环境的配置项`);

    const params = {
      categoryId: categoryId || undefined,
      search: search || undefined,
      type: type || undefined,
      isActive,
      page,
      pageSize,
      environment
    };

    const result = await configDbService.getConfigItems(params);
    return NextResponse.json({
      ...result,
      environment
    });
  } catch (error) {
    console.error('获取配置项失败:', error);
    return NextResponse.json(
      { error: '获取配置项失败' },
      { status: 500 }
    );
  }
}

// 创建新的配置项
async function createConfigItem(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      categoryId, 
      key, 
      displayName, 
      description, 
      value, 
      defaultValue, 
      type, 
      isRequired, 
      isSensitive, 
      validation, 
      sortOrder 
    } = body;
    
    if (!categoryId || !key || !displayName || !type) {
      return NextResponse.json(
        { error: '分类ID、配置键、显示名称和类型不能为空' },
        { status: 400 }
      );
    }

    const configItem = await configDbService.createConfigItem({
      categoryId,
      key,
      displayName,
      description: description || null,
      value: value || null,
      defaultValue: defaultValue || null,
      type,
      isRequired: isRequired || false,
      isSensitive: isSensitive || false,
      validation: validation || null,
      sortOrder: sortOrder || 0,
      isActive: true
    });
    
    return NextResponse.json(configItem);
  } catch (error) {
    console.error('创建配置项失败:', error);
    return NextResponse.json(
      { error: '创建配置项失败' },
      { status: 500 }
    );
  }
}

// 更新配置项
async function updateConfigItem(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      categoryId, 
      key, 
      displayName, 
      description, 
      value, 
      defaultValue, 
      type, 
      isRequired, 
      isSensitive, 
      validation, 
      sortOrder 
    } = body;
    
    if (!id || !categoryId || !key || !displayName || !type) {
      return NextResponse.json(
        { error: 'ID、分类ID、配置键、显示名称和类型不能为空' },
        { status: 400 }
      );
    }

    const configItem = await configDbService.updateConfigItem(id, {
      categoryId,
      key,
      displayName,
      description: description || null,
      value: value || null,
      defaultValue: defaultValue || null,
      type,
      isRequired: isRequired || false,
      isSensitive: isSensitive || false,
      validation: validation || null,
      sortOrder: sortOrder || 0
    });
    
    return NextResponse.json(configItem);
  } catch (error) {
    console.error('更新配置项失败:', error);
    return NextResponse.json(
      { error: '更新配置项失败' },
      { status: 500 }
    );
  }
}

// 删除配置项
async function deleteConfigItem(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '配置项ID不能为空' },
        { status: 400 }
      );
    }

    await configDbService.deleteConfigItem(id);
    
    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除配置项失败:', error);
    return NextResponse.json(
      { error: '删除配置项失败' },
      { status: 500 }
    );
  }
}

// 主处理函数
export async function GET(request: NextRequest) {
  return getConfigItems(request);
}

export async function POST(request: NextRequest) {
  return createConfigItem(request);
}

export async function PUT(request: NextRequest) {
  return updateConfigItem(request);
}

export async function DELETE(request: NextRequest) {
  return deleteConfigItem(request);
} 