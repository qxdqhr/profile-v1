/**
 * ShowMasterpiece 活动状态管理 API
 * 
 * 提供活动状态的快速更新功能。
 * 
 * 路由: /api/showmasterpiece/events/[id]/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { showmasterEvents } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT /api/showmasterpiece/events/[id]/status
 * 更新活动状态
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const eventId = parseInt(id);
    const body = await request.json();
    
    console.log('🔄 [活动API] 更新活动状态:', { eventId, body });

    if (isNaN(eventId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '无效的活动ID',
          details: '活动ID必须是有效的数字'
        },
        { status: 400 }
      );
    }

    const { status, isDefault } = body;

    // 验证状态值
    const validStatuses = ['draft', 'active', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '无效的活动状态',
          details: `状态必须是以下值之一: ${validStatuses.join(', ')}`
        },
        { status: 400 }
      );
    }

    // 检查活动是否存在
    const existingEvents = await db.select()
      .from(showmasterEvents)
      .where(eq(showmasterEvents.id, eventId))
      .limit(1);

    if (existingEvents.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '活动不存在',
          details: `ID为 ${eventId} 的活动不存在`
        },
        { status: 404 }
      );
    }

    // 如果设置为默认活动，先将其他活动的默认状态取消
    if (isDefault === true) {
      await db.update(showmasterEvents)
        .set({ isDefault: false })
        .where(eq(showmasterEvents.isDefault, true));
      
      console.log('✅ [活动API] 已清除其他活动的默认状态');
    }

    // 准备更新数据
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status !== undefined) updateData.status = status;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    // 更新活动状态
    const [updatedEvent] = await db.update(showmasterEvents)
      .set(updateData)
      .where(eq(showmasterEvents.id, eventId))
      .returning();

    console.log('✅ [活动API] 活动状态更新成功:', {
      eventId: updatedEvent.id,
      status: updatedEvent.status,
      isDefault: updatedEvent.isDefault
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedEvent.id,
        status: updatedEvent.status,
        isDefault: updatedEvent.isDefault,
        updatedAt: updatedEvent.updatedAt
      },
      message: '活动状态更新成功'
    });

  } catch (error) {
    console.error('❌ [活动API] 更新活动状态失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '更新活动状态失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
