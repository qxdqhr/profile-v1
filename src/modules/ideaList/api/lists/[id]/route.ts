import { NextRequest, NextResponse } from 'next/server';
import { ideaListDbService } from '../../../db/ideaListDbService';
import { validateApiAuth } from '@/modules/auth/server';
import type { IdeaListFormData } from '../../../types';

/**
 * PUT /api/ideaLists/lists/[id]
 * 更新指定的想法清单
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const listId = parseInt(params.id);
    if (isNaN(listId)) {
      return NextResponse.json(
        { success: false, message: '无效的清单ID' },
        { status: 400 }
      );
    }

    // 验证清单是否存在且属于当前用户
    const existingList = await ideaListDbService.getIdeaListById(listId);
    if (!existingList) {
      return NextResponse.json(
        { success: false, message: '清单不存在' },
        { status: 404 }
      );
    }

    if (existingList.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: '无权限操作此清单' },
        { status: 403 }
      );
    }

    // 获取请求数据
    const body: Partial<IdeaListFormData> = await request.json();
    
    // 验证数据
    if (body.name !== undefined) {
      if (!body.name || body.name.trim().length === 0) {
        return NextResponse.json(
          { success: false, message: '清单名称不能为空' },
          { status: 400 }
        );
      }

      if (body.name.trim().length > 100) {
        return NextResponse.json(
          { success: false, message: '清单名称不能超过100个字符' },
          { status: 400 }
        );
      }
    }

    // 更新清单
    const updatedList = await ideaListDbService.updateIdeaList(listId, {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.color !== undefined && { color: body.color }),
    });

    if (!updatedList) {
      return NextResponse.json(
        { success: false, message: '更新清单失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedList,
    });
  } catch (error) {
    console.error('更新想法清单失败:', error);
    return NextResponse.json(
      { success: false, message: '更新想法清单失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ideaLists/lists/[id]
 * 删除指定的想法清单
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const listId = parseInt(params.id);
    if (isNaN(listId)) {
      return NextResponse.json(
        { success: false, message: '无效的清单ID' },
        { status: 400 }
      );
    }

    // 验证清单是否存在且属于当前用户
    const existingList = await ideaListDbService.getIdeaListById(listId);
    if (!existingList) {
      return NextResponse.json(
        { success: false, message: '清单不存在' },
        { status: 404 }
      );
    }

    if (existingList.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: '无权限操作此清单' },
        { status: 403 }
      );
    }

    // 删除清单
    const success = await ideaListDbService.deleteIdeaList(listId);
    if (!success) {
      return NextResponse.json(
        { success: false, message: '删除清单失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '清单删除成功',
    });
  } catch (error) {
    console.error('删除想法清单失败:', error);
    return NextResponse.json(
      { success: false, message: '删除想法清单失败' },
      { status: 500 }
    );
  }
} 