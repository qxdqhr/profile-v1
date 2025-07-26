/**
 * ShowMasterpiece 模块 - 预订API路由
 * 
 * 处理画集预订相关的HTTP请求，包括：
 * - GET: 获取预订列表
 * - POST: 创建新预订
 * 
 * @fileoverview 预订API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { comicUniverseBookings, comicUniverseCollections } from '@/db/schema';
import { eq, and, desc, asc, like, sql } from 'drizzle-orm';
import { CreateBookingRequest, BookingListParams } from '@/modules/showmasterpiece/types/booking';

/**
 * 获取预订列表
 * 
 * @param request Next.js请求对象
 * @returns 预订列表和分页信息
 */
async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析查询参数
    const params: BookingListParams = {
      collectionId: searchParams.get('collectionId') ? parseInt(searchParams.get('collectionId')!) : undefined,
      qqNumber: searchParams.get('qqNumber') || undefined,
      status: searchParams.get('status') as any || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    };

    // 构建查询条件
    const conditions = [];
    
    if (params.collectionId) {
      conditions.push(eq(comicUniverseBookings.collectionId, params.collectionId));
    }
    
    if (params.qqNumber) {
      conditions.push(like(comicUniverseBookings.qqNumber, `%${params.qqNumber}%`));
    }
    
    if (params.status) {
      conditions.push(eq(comicUniverseBookings.status, params.status));
    }

    // 计算分页
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    // 查询总数
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(comicUniverseBookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalResult[0]?.count || 0;

    // 查询预订列表（包含画集信息）
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
        collectionNumber: comicUniverseCollections.number,
        collectionCoverImage: comicUniverseCollections.coverImage,
        collectionPrice: comicUniverseCollections.price,
      })
      .from(comicUniverseBookings)
      .leftJoin(comicUniverseCollections, eq(comicUniverseBookings.collectionId, comicUniverseCollections.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(comicUniverseBookings.createdAt))
      .limit(limit)
      .offset(offset);

    // 格式化响应数据
    const formattedBookings = bookings.map(booking => ({
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
        number: booking.collectionNumber,
        coverImage: booking.collectionCoverImage,
        price: booking.collectionPrice,
      }
    }));

    return NextResponse.json({
      bookings: formattedBookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error('获取预订列表失败:', error);
    return NextResponse.json(
      { message: '获取预订列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建新预订
 * 
 * @param request Next.js请求对象
 * @returns 创建的预订信息
 */
async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json();

    // 数据验证
    if (!body.collectionId || !body.qqNumber || !body.phoneNumber || !body.quantity) {
      return NextResponse.json(
        { message: '缺少必要参数：画集ID、QQ号、手机号、预订数量' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(body.phoneNumber)) {
      return NextResponse.json(
        { message: '手机号格式不正确' },
        { status: 400 }
      );
    }

    if (body.quantity < 1) {
      return NextResponse.json(
        { message: '预订数量必须大于0' },
        { status: 400 }
      );
    }

    // 验证QQ号格式（简单验证）
    const qqRegex = /^\d{5,11}$/;
    if (!qqRegex.test(body.qqNumber)) {
      return NextResponse.json(
        { message: 'QQ号格式不正确' },
        { status: 400 }
      );
    }

    // 检查画集是否存在
    const collection = await db
      .select({ id: comicUniverseCollections.id })
      .from(comicUniverseCollections)
      .where(eq(comicUniverseCollections.id, body.collectionId))
      .limit(1);

    if (collection.length === 0) {
      return NextResponse.json(
        { message: '画集不存在' },
        { status: 404 }
      );
    }

    // 检查是否已存在相同的预订（QQ号+手机号+画集ID）
    const existingBooking = await db
      .select({ 
        id: comicUniverseBookings.id,
        quantity: comicUniverseBookings.quantity,
        notes: comicUniverseBookings.notes
      })
      .from(comicUniverseBookings)
      .where(
        and(
          eq(comicUniverseBookings.qqNumber, body.qqNumber),
          eq(comicUniverseBookings.phoneNumber, body.phoneNumber),
          eq(comicUniverseBookings.collectionId, body.collectionId)
        )
      )
      .limit(1);

    let resultBooking;

    if (existingBooking.length > 0) {
      // 如果已存在，累加数量而不是创建新预订
      const existing = existingBooking[0];
      const newQuantity = existing.quantity + body.quantity;
      
      // 合并备注信息
      const combinedNotes = existing.notes 
        ? `${existing.notes}; 新增预订: ${body.notes || '无备注'}`
        : body.notes || null;

      const [updatedBooking] = await db
        .update(comicUniverseBookings)
        .set({
          quantity: newQuantity,
          notes: combinedNotes,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(comicUniverseBookings.qqNumber, body.qqNumber),
            eq(comicUniverseBookings.phoneNumber, body.phoneNumber),
            eq(comicUniverseBookings.collectionId, body.collectionId)
          )
        )
        .returning();

      resultBooking = updatedBooking;
    } else {
      // 如果不存在，创建新预订
      const [newBooking] = await db
        .insert(comicUniverseBookings)
        .values({
          collectionId: body.collectionId,
          qqNumber: body.qqNumber,
          phoneNumber: body.phoneNumber,
          quantity: body.quantity,
          notes: body.notes || null,
          status: 'pending',
        })
        .returning();

      resultBooking = newBooking;
    }

    return NextResponse.json({
      id: resultBooking.id,
      collectionId: resultBooking.collectionId,
      qqNumber: resultBooking.qqNumber,
      phoneNumber: resultBooking.phoneNumber,
      quantity: resultBooking.quantity,
      status: resultBooking.status,
      notes: resultBooking.notes,
      createdAt: resultBooking.createdAt instanceof Date ? resultBooking.createdAt.toISOString() : resultBooking.createdAt,
      updatedAt: resultBooking.updatedAt instanceof Date ? resultBooking.updatedAt.toISOString() : resultBooking.updatedAt,
    }, { status: 201 });

  } catch (error) {
    console.error('创建预订失败:', error);
    return NextResponse.json(
      { message: '创建预订失败' },
      { status: 500 }
    );
  }
}

export { GET, POST }; 