/**
 * ShowMasterpiece 模块 - 预订状态更新API路由
 * 
 * 管理员专用的预订状态更新API，提供：
 * - PUT: 更新预订状态和管理员备注
 * 
 * @fileoverview 预订状态更新API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { comicUniverseBookings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { BookingStatus } from '@/modules/showmasterpiece/types/booking';

/**
 * 更新预订状态
 * 
 * @param request Next.js请求对象
 * @param params 路由参数，包含预订ID
 * @returns 更新后的预订信息
 */
async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { message: '无效的预订ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, adminNotes } = body;

    // 验证状态值
    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { message: '无效的预订状态' },
        { status: 400 }
      );
    }

    // 检查预订是否存在
    const existingBooking = await db
      .select()
      .from(comicUniverseBookings)
      .where(eq(comicUniverseBookings.id, bookingId))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { message: '预订不存在' },
        { status: 404 }
      );
    }

    // 准备更新数据
    const updateData: any = {
      status: status as BookingStatus,
      updatedAt: new Date(),
    };

    // 如果提供了管理员备注，则更新
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    // 根据状态设置相应的时间字段
    switch (status) {
      case 'confirmed':
        updateData.confirmedAt = new Date();
        break;
      case 'completed':
        updateData.completedAt = new Date();
        break;
      case 'cancelled':
        updateData.cancelledAt = new Date();
        break;
    }

    // 更新预订
    const updatedBookings = await db
      .update(comicUniverseBookings)
      .set(updateData)
      .where(eq(comicUniverseBookings.id, bookingId))
      .returning();

    if (updatedBookings.length === 0) {
      return NextResponse.json(
        { message: '更新预订失败' },
        { status: 500 }
      );
    }

    const updatedBooking = updatedBookings[0];

    // 返回更新后的预订信息
    return NextResponse.json({
      id: updatedBooking.id,
      collectionId: updatedBooking.collectionId,
      qqNumber: updatedBooking.qqNumber,
      phoneNumber: updatedBooking.phoneNumber,
      quantity: updatedBooking.quantity,
      status: updatedBooking.status,
      notes: updatedBooking.notes,
      adminNotes: updatedBooking.adminNotes,
      createdAt: updatedBooking.createdAt.toISOString(),
      updatedAt: updatedBooking.updatedAt.toISOString(),
      confirmedAt: updatedBooking.confirmedAt?.toISOString(),
      completedAt: updatedBooking.completedAt?.toISOString(),
      cancelledAt: updatedBooking.cancelledAt?.toISOString(),
    });

  } catch (error) {
    console.error('更新预订状态失败:', error);
    return NextResponse.json(
      { message: '更新预订状态失败' },
      { status: 500 }
    );
  }
}

export { PUT }; 