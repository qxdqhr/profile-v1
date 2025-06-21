import { NextRequest, NextResponse } from 'next/server';
import { ideaListDbService } from '../../db/ideaListDbService';
import { validateApiAuth } from '@/modules/auth/server';
import type { IdeaListFormData } from '../../types';

/**
 * GET /api/ideaLists/lists
 * 获取当前用户的所有想法清单
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

    // 获取用户的所有想法清单
    const ideaLists = await ideaListDbService.getUserIdeaLists(user.id);

    return NextResponse.json({
      success: true,
      data: ideaLists,
    });
  } catch (error) {
    console.error('获取想法清单失败:', error);
    return NextResponse.json(
      { success: false, message: '获取想法清单失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ideaLists/lists
 * 创建新的想法清单
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
    const body: IdeaListFormData = await request.json();
    
    // 验证必填字段
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

    // 创建想法清单
    const newList = await ideaListDbService.createIdeaList({
      userId: user.id,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      color: body.color || 'blue',
    });

    return NextResponse.json({
      success: true,
      data: newList,
    });
  } catch (error) {
    console.error('创建想法清单失败:', error);
    return NextResponse.json(
      { success: false, message: '创建想法清单失败' },
      { status: 500 }
    );
  }
} 