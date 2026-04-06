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
import { BookingCommandError, createBookingCommandService } from 'sa2kit/showmasterpiece/server';
import { validateApiAuth } from '@/lib/auth/legacy';

const bookingCommandService = createBookingCommandService(db);

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
  const user = await validateApiAuth(request);
  if (!user) {
    return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: '无效的预订ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, adminNotes } = body;

    const updatedBooking = await bookingCommandService.updateBookingStatus(
      bookingId,
      status,
      adminNotes
    );

    return NextResponse.json({
      id: updatedBooking.id,
      collectionId: updatedBooking.collectionId,
      qqNumber: updatedBooking.qqNumber,
      phoneNumber: updatedBooking.phoneNumber,
      quantity: updatedBooking.quantity,
      status: updatedBooking.status,
      notes: updatedBooking.notes,
      adminNotes: updatedBooking.adminNotes,
      createdAt: updatedBooking.createdAt?.toISOString?.() ?? updatedBooking.createdAt,
      updatedAt: updatedBooking.updatedAt?.toISOString?.() ?? updatedBooking.updatedAt,
      confirmedAt: updatedBooking.confirmedAt?.toISOString?.() ?? updatedBooking.confirmedAt,
      completedAt: updatedBooking.completedAt?.toISOString?.() ?? updatedBooking.completedAt,
      cancelledAt: updatedBooking.cancelledAt?.toISOString?.() ?? updatedBooking.cancelledAt,
    });

  } catch (error) {
    if (error instanceof BookingCommandError) {
      const statusCode = error.code === 'BOOKING_NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status: statusCode });
    }

    console.error('更新预订状态失败:', error);
    return NextResponse.json(
      { error: '更新预订状态失败' },
      { status: 500 }
    );
  }
}

export { PUT }; 
