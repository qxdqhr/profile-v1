import { NextRequest, NextResponse } from 'next/server';
import { configDbService } from '../../db/configDbService';
import { validateApiAuth } from '@/modules/auth/server';

/**
 * 获取配置项列表
 * GET /api/configManager/items
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const params = {
      categoryId: searchParams.get('categoryId') || undefined,
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') as any || undefined,
      isActive: searchParams.get('isActive') === 'true',
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20')
    };

    const result = await configDbService.getConfigItems(params);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取配置项失败:', error);
    return NextResponse.json(
      { error: '获取配置项失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建配置项
 * POST /api/configManager/items
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const itemData = await request.json();
    
    // 验证必填字段
    if (!itemData.key || !itemData.displayName || !itemData.type || !itemData.categoryId) {
      return NextResponse.json(
        { error: '配置键、显示名称、类型和分类ID不能为空' },
        { status: 400 }
      );
    }

    // 检查配置键是否已存在
    const existingItem = await configDbService.getConfigItemByKey(itemData.key);
    if (existingItem) {
      return NextResponse.json(
        { error: '配置键已存在' },
        { status: 400 }
      );
    }

    const newItem = await configDbService.createConfigItem({
      categoryId: itemData.categoryId,
      key: itemData.key,
      displayName: itemData.displayName,
      description: itemData.description,
      value: itemData.value || '',
      defaultValue: itemData.defaultValue,
      type: itemData.type,
      isRequired: itemData.isRequired || false,
      isSensitive: itemData.isSensitive || false,
      validation: itemData.validation,
      sortOrder: itemData.sortOrder || 0,
      isActive: true
    });

    return NextResponse.json({
      success: true,
      data: newItem,
      message: '配置项创建成功'
    });
  } catch (error) {
    console.error('创建配置项失败:', error);
    return NextResponse.json(
      { error: '创建配置项失败' },
      { status: 500 }
    );
  }
}

/**
 * 批量更新配置项
 * PATCH /api/configManager/items
 */
export async function PATCH(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    const { updates } = await request.json();
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: '更新数据格式错误' },
        { status: 400 }
      );
    }

    const updatedItems = await configDbService.batchUpdateConfigItems(updates);

    // 记录变更历史
    for (const update of updates) {
      const item = await configDbService.getConfigItemById(update.id);
      if (item) {
        await configDbService.recordConfigHistory(
          update.id,
          item.value,
          update.value,
          user.id.toString(),
          '批量更新配置'
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedItems,
      message: '配置项更新成功'
    });
  } catch (error) {
    console.error('更新配置项失败:', error);
    return NextResponse.json(
      { error: '更新配置项失败' },
      { status: 500 }
    );
  }
} 