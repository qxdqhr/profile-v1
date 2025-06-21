import { NextRequest, NextResponse } from 'next/server';
import { ideaListDbService } from '../../../db/ideaListDbService';
import { validateApiAuth } from '@/modules/auth/server';
import type { IdeaItemFormData } from '../../../types';

/**
 * PUT /api/ideaLists/items/[id]
 * 更新指定的想法项目
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户身份
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    const itemId = parseInt(params.id);
    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, message: '无效的项目ID' },
        { status: 400 }
      );
    }

    // 获取项目信息
    const existingItem = await ideaListDbService.getIdeaItemById(itemId);
    if (!existingItem) {
      return NextResponse.json(
        { success: false, message: '项目不存在' },
        { status: 404 }
      );
    }

    // 验证项目所属的清单是否属于当前用户
    const list = await ideaListDbService.getIdeaListById(existingItem.listId);
    if (!list || list.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: '无权限操作此项目' },
        { status: 403 }
      );
    }

    // 获取请求数据
    const body: Partial<IdeaItemFormData> = await request.json();
    
    // 验证数据
    if (body.title !== undefined) {
      if (!body.title || body.title.trim().length === 0) {
        return NextResponse.json(
          { success: false, message: '想法标题不能为空' },
          { status: 400 }
        );
      }

      if (body.title.trim().length > 200) {
        return NextResponse.json(
          { success: false, message: '想法标题不能超过200个字符' },
          { status: 400 }
        );
      }
    }

    if (body.priority !== undefined) {
      const validPriorities = ['high', 'medium', 'low'];
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { success: false, message: '无效的优先级' },
          { status: 400 }
        );
      }
    }

    // 更新项目
    const updatedItem = await ideaListDbService.updateIdeaItem(itemId, {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.tags !== undefined && { tags: body.tags }),
    });

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, message: '更新项目失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error('更新想法项目失败:', error);
    return NextResponse.json(
      { success: false, message: '更新想法项目失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ideaLists/items/[id]
 * 删除指定的想法项目
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户身份
    const user = await validateApiAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    const itemId = parseInt(params.id);
    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, message: '无效的项目ID' },
        { status: 400 }
      );
    }

    // 获取项目信息
    const existingItem = await ideaListDbService.getIdeaItemById(itemId);
    if (!existingItem) {
      return NextResponse.json(
        { success: false, message: '项目不存在' },
        { status: 404 }
      );
    }

    // 验证项目所属的清单是否属于当前用户
    const list = await ideaListDbService.getIdeaListById(existingItem.listId);
    if (!list || list.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: '无权限操作此项目' },
        { status: 403 }
      );
    }

    // 删除项目
    const success = await ideaListDbService.deleteIdeaItem(itemId);
    if (!success) {
      return NextResponse.json(
        { success: false, message: '删除项目失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '项目删除成功',
    });
  } catch (error) {
    console.error('删除想法项目失败:', error);
    return NextResponse.json(
      { success: false, message: '删除想法项目失败' },
      { status: 500 }
    );
  }
} 