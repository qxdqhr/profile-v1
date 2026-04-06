/**
 * ShowMasterpiece 模块 - 单个预订操作API路由
 * 
 * 处理单个预订的HTTP请求，包括：
 * - GET: 获取预订详情
 * - PUT: 更新预订信息
 * 
 * 注意：DELETE 操作已移至 /bookings/admin/[id]（需管理员鉴权）
 * 
 * @fileoverview 单个预订操作API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import type { UpdateBookingRequest } from 'sa2kit/showmasterpiece';
import {
  BookingCommandError,
  createBookingCommandService,
  createBookingQueryService,
} from 'sa2kit/showmasterpiece/server';

// DELETE 已移至 /bookings/admin/[id]（需管理员鉴权）

const bookingQueryService = createBookingQueryService(db);
const bookingCommandService = createBookingCommandService(db);

/**
 * 获取预订详情
 * 
 * @param request Next.js请求对象
 * @param params 路由参数
 * @returns 预订详情
 */
async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的预订ID' },
        { status: 400 }
      );
    }

    const booking = await bookingQueryService.getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { error: '预订不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json(booking);

  } catch (error) {
    console.error('获取预订详情失败:', error);
    return NextResponse.json(
      { error: '获取预订详情失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新预订状态
 * 
 * @param request Next.js请求对象
 * @param params 路由参数
 * @returns 更新后的预订信息
 */
async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的预订ID' },
        { status: 400 }
      );
    }

    const body: UpdateBookingRequest = await request.json();

    const updatedBooking = await bookingCommandService.updateBooking(id, body);
    return NextResponse.json(updatedBooking);

  } catch (error) {
    if (error instanceof BookingCommandError) {
      const status = error.code === 'BOOKING_NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    console.error('更新预订失败:', error);
    return NextResponse.json(
      { error: '更新预订失败' },
      { status: 500 }
    );
  }
}

export { GET, PUT }; 
