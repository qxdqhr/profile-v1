import { NextRequest, NextResponse } from 'next/server';
import { ideaListDbService } from '../../db/ideaListDbService';
import { validateApiAuth } from '@/modules/auth/server';
import type { IdeaItemFormData } from '../../types';

/**
 * GET /api/ideaLists/items?listId=xxx
 * 获取指定清单的所有项目
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const listIdParam = searchParams.get('listId');
    
    if (!listIdParam) {
      return NextResponse.json(
        { success: false, message: '缺少清单ID参数' },
        { status: 400 }
      );
    }

    const listId = parseInt(listIdParam);
    if (isNaN(listId)) {
      return NextResponse.json(
        { success: false, message: '无效的清单ID' },
        { status: 400 }
      );
    }

    // 验证清单是否存在且属于当前用户
    const list = await ideaListDbService.getIdeaListById(listId);
    if (!list) {
      return NextResponse.json(
        { success: false, message: '清单不存在' },
        { status: 404 }
      );
    }

    if (list.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: '无权限访问此清单' },
        { status: 403 }
      );
    }

    // 获取项目列表
    const items = await ideaListDbService.getIdeaItemsByListId(listId);

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('获取想法项目失败:', error);
    return NextResponse.json(
      { success: false, message: '获取想法项目失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ideaLists/items
 * 创建新的想法项目
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    // 获取请求数据
    const body = await request.json();
    const { listId, ...itemData }: { listId: number } & IdeaItemFormData = body;
    
    // 验证必填字段
    if (!listId || isNaN(listId)) {
      return NextResponse.json(
        { success: false, message: '无效的清单ID' },
        { status: 400 }
      );
    }

    if (!itemData.title || itemData.title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: '想法标题不能为空' },
        { status: 400 }
      );
    }

    if (itemData.title.trim().length > 200) {
      return NextResponse.json(
        { success: false, message: '想法标题不能超过200个字符' },
        { status: 400 }
      );
    }

    // 验证清单是否存在且属于当前用户
    const list = await ideaListDbService.getIdeaListById(listId);
    if (!list) {
      return NextResponse.json(
        { success: false, message: '清单不存在' },
        { status: 404 }
      );
    }

    if (list.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: '无权限操作此清单' },
        { status: 403 }
      );
    }

    // 验证优先级
    const validPriorities = ['high', 'medium', 'low'];
    if (itemData.priority && !validPriorities.includes(itemData.priority)) {
      return NextResponse.json(
        { success: false, message: '无效的优先级' },
        { status: 400 }
      );
    }

    // 创建想法项目
    const newItem = await ideaListDbService.createIdeaItem({
      listId,
      title: itemData.title.trim(),
      description: itemData.description?.trim() || null,
      priority: itemData.priority || 'medium',
      tags: itemData.tags || [],
    });

    return NextResponse.json({
      success: true,
      data: newItem,
    });
  } catch (error) {
    console.error('创建想法项目失败:', error);
    return NextResponse.json(
      { success: false, message: '创建想法项目失败' },
      { status: 500 }
    );
  }
} 