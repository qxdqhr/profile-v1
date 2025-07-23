/**
 * ShowMasterpiece 模块 - 单个预订操作API路由
 * 
 * 处理单个预订的HTTP请求，包括：
 * - GET: 获取预订详情
 * - PUT: 更新预订状态
 * - DELETE: 删除预订
 * 
 * @fileoverview 单个预订操作API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { comicUniverseBookings, comicUniverseCollections } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { UpdateBookingRequest } from '@/modules/showmasterpiece/types/booking';

/**
 * 获取预订详情
 * 
 * @param request Next.js请求对象
 * @param params 路由参数
 * @returns 预订详情
 */
async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: '无效的预订ID' },
        { status: 400 }
      );
    }

    // 查询预订详情（包含画集信息）
    const bookings = await db
      .select({
        id: comicUniverseBookings.id,
        collectionId: comicUniverseBookings.collectionId,
        qqNumber: comicUniverseBookings.qqNumber,
        phoneNumber: comicUniverseBookings.phoneNumber,
        quantity: comicUniverseBookings.quantity,
        status: comicUniverseBookings.status,
        notes: comicUniverseBookings.notes,
        adminNotes: comicUniverseBookings.adminNotes,
        createdAt: comicUniverseBookings.createdAt,
        updatedAt: comicUniverseBookings.updatedAt,
        confirmedAt: comicUniverseBookings.confirmedAt,
        completedAt: comicUniverseBookings.completedAt,
        cancelledAt: comicUniverseBookings.cancelledAt,
        // 画集信息
        collectionTitle: comicUniverseCollections.title,
        collectionArtist: comicUniverseCollections.artist,
        collectionCoverImage: comicUniverseCollections.coverImage,
        collectionPrice: comicUniverseCollections.price,
        collectionDescription: comicUniverseCollections.description,
      })
      .from(comicUniverseBookings)
      .leftJoin(comicUniverseCollections, eq(comicUniverseBookings.collectionId, comicUniverseCollections.id))
      .where(eq(comicUniverseBookings.id, id))
      .limit(1);

    if (bookings.length === 0) {
      return NextResponse.json(
        { message: '预订不存在' },
        { status: 404 }
      );
    }

    const booking = bookings[0];

    // 格式化响应数据
    const formattedBooking = {
      id: booking.id,
      collectionId: booking.collectionId,
      qqNumber: booking.qqNumber,
      phoneNumber: booking.phoneNumber,
      quantity: booking.quantity,
      status: booking.status,
      notes: booking.notes,
      adminNotes: booking.adminNotes,
      createdAt: booking.createdAt?.toISOString(),
      updatedAt: booking.updatedAt?.toISOString(),
      confirmedAt: booking.confirmedAt?.toISOString(),
      completedAt: booking.completedAt?.toISOString(),
      cancelledAt: booking.cancelledAt?.toISOString(),
      collection: {
        id: booking.collectionId,
        title: booking.collectionTitle,
        artist: booking.collectionArtist,
        coverImage: booking.collectionCoverImage,
        price: booking.collectionPrice,
        description: booking.collectionDescription,
      }
    };

    return NextResponse.json(formattedBooking);

  } catch (error) {
    console.error('获取预订详情失败:', error);
    return NextResponse.json(
      { message: '获取预订详情失败' },
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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: '无效的预订ID' },
        { status: 400 }
      );
    }

    const body: UpdateBookingRequest = await request.json();

    // 检查预订是否存在
    const existingBooking = await db
      .select({ id: comicUniverseBookings.id })
      .from(comicUniverseBookings)
      .where(eq(comicUniverseBookings.id, id))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { message: '预订不存在' },
        { status: 404 }
      );
    }

    // 构建更新数据
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.status) {
      updateData.status = body.status;
      
      // 根据状态设置对应的时间字段
      switch (body.status) {
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
    }

    if (body.adminNotes !== undefined) {
      updateData.adminNotes = body.adminNotes;
    }

    // 更新预订
    const [updatedBooking] = await db
      .update(comicUniverseBookings)
      .set(updateData)
      .where(eq(comicUniverseBookings.id, id))
      .returning();

    return NextResponse.json({
      id: updatedBooking.id,
      collectionId: updatedBooking.collectionId,
      qqNumber: updatedBooking.qqNumber,
      quantity: updatedBooking.quantity,
      status: updatedBooking.status,
      notes: updatedBooking.notes,
      adminNotes: updatedBooking.adminNotes,
      createdAt: updatedBooking.createdAt?.toISOString(),
      updatedAt: updatedBooking.updatedAt?.toISOString(),
      confirmedAt: updatedBooking.confirmedAt?.toISOString(),
      completedAt: updatedBooking.completedAt?.toISOString(),
      cancelledAt: updatedBooking.cancelledAt?.toISOString(),
    });

  } catch (error) {
    console.error('更新预订失败:', error);
    return NextResponse.json(
      { message: '更新预订失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除预订
 * 
 * @param request Next.js请求对象
 * @param params 路由参数
 * @returns 删除结果
 */
async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: '无效的预订ID' },
        { status: 400 }
      );
    }

    // 检查预订是否存在
    const existingBooking = await db
      .select({ id: comicUniverseBookings.id })
      .from(comicUniverseBookings)
      .where(eq(comicUniverseBookings.id, id))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { message: '预订不存在' },
        { status: 404 }
      );
    }

    // 删除预订
    await db
      .delete(comicUniverseBookings)
      .where(eq(comicUniverseBookings.id, id));

    return NextResponse.json(
      { message: '预订删除成功' },
      { status: 200 }
    );

  } catch (error) {
    console.error('删除预订失败:', error);
    return NextResponse.json(
      { message: '删除预订失败' },
      { status: 500 }
    );
  }
}

export { GET, PUT, DELETE }; 