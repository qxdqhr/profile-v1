import { NextRequest, NextResponse } from 'next/server';
import { ideaListDbService } from '../../../../db/ideaListDbService';
import { validateApiAuth } from '@/modules/auth/server';

/**
 * POST /api/ideaLists/items/[id]/toggle
 * 切换想法项目的完成状态
 */
export async function POST(
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

    // 切换完成状态
    const updatedItem = await ideaListDbService.toggleIdeaItemComplete(itemId);
    if (!updatedItem) {
      return NextResponse.json(
        { success: false, message: '切换状态失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: updatedItem.isCompleted ? '标记为已完成' : '标记为未完成',
    });
  } catch (error) {
    console.error('切换想法项目状态失败:', error);
    return NextResponse.json(
      { success: false, message: '切换状态失败' },
      { status: 500 }
    );
  }
} 