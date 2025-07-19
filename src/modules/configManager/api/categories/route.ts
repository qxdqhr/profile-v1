import { NextRequest, NextResponse } from 'next/server';
import { configDbService } from '../../db/configDbService';
import { validateApiAuth } from '@/modules/auth/server';

/**
 * 获取所有配置分类
 * GET /api/configManager/categories
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const categories = await configDbService.getAllCategories();
    
    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取配置分类失败:', error);
    return NextResponse.json(
      { error: '获取配置分类失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建配置分类
 * POST /api/configManager/categories
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const categoryData = await request.json();
    
    // 验证必填字段
    if (!categoryData.name || !categoryData.displayName) {
      return NextResponse.json(
        { error: '分类名称和显示名称不能为空' },
        { status: 400 }
      );
    }

    const newCategory = await configDbService.createCategory({
      name: categoryData.name,
      displayName: categoryData.displayName,
      description: categoryData.description,
      icon: categoryData.icon,
      sortOrder: categoryData.sortOrder || 0,
      isActive: true
    });

    return NextResponse.json({
      success: true,
      data: newCategory,
      message: '配置分类创建成功'
    });
  } catch (error) {
    console.error('创建配置分类失败:', error);
    return NextResponse.json(
      { error: '创建配置分类失败' },
      { status: 500 }
    );
  }
} 