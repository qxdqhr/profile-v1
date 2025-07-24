/**
 * ShowMasterpiece 模块 - 预订管理API路由
 * 
 * 管理员专用的预订管理API，提供：
 * - GET: 获取所有预订数据和统计信息
 * 
 * @fileoverview 预订管理API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { comicUniverseBookings, comicUniverseCollections } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';
import { BookingStatus } from '@/modules/showmasterpiece/types/booking';
import { eq } from 'drizzle-orm';

/**
 * 获取所有预订数据和统计信息（管理员专用）
 * 
 * @param request Next.js请求对象
 * @returns 所有预订数据和统计信息
 */
async function GET(request: NextRequest) {
  try {
    // 获取所有预订数据（包含画集信息）
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
      })
      .from(comicUniverseBookings)
      .leftJoin(comicUniverseCollections, eq(comicUniverseBookings.collectionId, comicUniverseCollections.id))
      .orderBy(desc(comicUniverseBookings.createdAt));

    // 计算统计信息
    const stats = await db
      .select({
        totalBookings: sql<number>`count(*)`,
        pendingBookings: sql<number>`count(*) filter (where ${comicUniverseBookings.status} = 'pending')`,
        confirmedBookings: sql<number>`count(*) filter (where ${comicUniverseBookings.status} = 'confirmed')`,
        completedBookings: sql<number>`count(*) filter (where ${comicUniverseBookings.status} = 'completed')`,
        cancelledBookings: sql<number>`count(*) filter (where ${comicUniverseBookings.status} = 'cancelled')`,
        totalQuantity: sql<number>`coalesce(sum(${comicUniverseBookings.quantity}), 0)`,
        totalRevenue: sql<number>`coalesce(sum(${comicUniverseBookings.quantity} * coalesce(${comicUniverseCollections.price}, 0)), 0)`,
      })
      .from(comicUniverseBookings)
      .leftJoin(comicUniverseCollections, eq(comicUniverseBookings.collectionId, comicUniverseCollections.id));

    // 格式化预订数据
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      collectionId: booking.collectionId,
      qqNumber: booking.qqNumber,
      phoneNumber: booking.phoneNumber,
      quantity: booking.quantity,
      status: booking.status,
      notes: booking.notes,
      adminNotes: booking.adminNotes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      confirmedAt: booking.confirmedAt?.toISOString(),
      completedAt: booking.completedAt?.toISOString(),
      cancelledAt: booking.cancelledAt?.toISOString(),
      collection: {
        id: booking.collectionId,
        title: booking.collectionTitle || '未知画集',
        artist: booking.collectionArtist || '未知艺术家',
        coverImage: booking.collectionCoverImage || '',
        price: booking.collectionPrice || 0,
      },
      totalPrice: (booking.collectionPrice || 0) * booking.quantity,
    }));

    // 格式化统计信息
    const formattedStats = {
      totalBookings: stats[0]?.totalBookings || 0,
      pendingBookings: stats[0]?.pendingBookings || 0,
      confirmedBookings: stats[0]?.confirmedBookings || 0,
      completedBookings: stats[0]?.completedBookings || 0,
      cancelledBookings: stats[0]?.cancelledBookings || 0,
      totalQuantity: stats[0]?.totalQuantity || 0,
      totalRevenue: stats[0]?.totalRevenue || 0,
    };

    const response = NextResponse.json({
      bookings: formattedBookings,
      stats: formattedStats,
    });

    // 添加缓存控制头，防止缓存
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('获取预订管理数据失败:', error);
    return NextResponse.json(
      { message: '获取预订管理数据失败' },
      { status: 500 }
    );
  }
}

export { GET }; 