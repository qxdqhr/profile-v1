/**
 * 配置管理模块 - 分类API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { configDbService } from '@/modules/configManager/db/configDbService';

// 获取所有配置分类
async function getCategories() {
  try {
    const categories = await configDbService.getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('获取配置分类失败:', error);
    return NextResponse.json(
      { error: '获取配置分类失败' },
      { status: 500 }
    );
  }
}

// 创建新的配置分类
async function createCategory(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, displayName, description, icon, sortOrder } = body;
    
    if (!name || !displayName) {
      return NextResponse.json(
        { error: '分类名称和显示名称不能为空' },
        { status: 400 }
      );
    }

    const category = await configDbService.createCategory({
      name,
      displayName,
      description: description || null,
      icon: icon || null,
      sortOrder: sortOrder || 0,
      isActive: true
    });
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('创建配置分类失败:', error);
    return NextResponse.json(
      { error: '创建配置分类失败' },
      { status: 500 }
    );
  }
}

// 更新配置分类
async function updateCategory(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, displayName, description, icon, sortOrder } = body;
    
    if (!id || !name || !displayName) {
      return NextResponse.json(
        { error: '分类ID、名称和显示名称不能为空' },
        { status: 400 }
      );
    }

    const category = await configDbService.updateCategory(id, {
      name,
      displayName,
      description: description || null,
      icon: icon || null,
      sortOrder: sortOrder || 0
    });
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('更新配置分类失败:', error);
    return NextResponse.json(
      { error: '更新配置分类失败' },
      { status: 500 }
    );
  }
}

// 删除配置分类
async function deleteCategory(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '分类ID不能为空' },
        { status: 400 }
      );
    }

    await configDbService.deleteCategory(id);
    
    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除配置分类失败:', error);
    return NextResponse.json(
      { error: '删除配置分类失败' },
      { status: 500 }
    );
  }
}

// 主处理函数
export async function GET() {
  return getCategories();
}

export async function POST(request: NextRequest) {
  return createCategory(request);
}

export async function PUT(request: NextRequest) {
  return updateCategory(request);
}

export async function DELETE(request: NextRequest) {
  return deleteCategory(request);
} 