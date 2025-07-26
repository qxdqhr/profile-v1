/**
 * ShowMasterpiece 模块 - 预订管理强制刷新API路由
 * 
 * 专门用于强制刷新预订数据的API，绕过所有缓存机制
 * 
 * @fileoverview 预订管理强制刷新API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, forceRefreshDatabaseConnection, getDatabaseConnectionStatus } from '@/db';
import { comicUniverseBookings, comicUniverseCollections } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

/**
 * 强制刷新获取所有预订数据和统计信息（管理员专用）
 * 
 * @param request Next.js请求对象
 * @returns 所有预订数据和统计信息
 */
async function GET(request: NextRequest) {
  try {
    console.log('🔄 强制刷新预订数据 - 开始执行...');
    
    // 检查数据库连接状态
    const connectionStatus = await getDatabaseConnectionStatus();
    console.log('数据库连接状态:', connectionStatus);
    
    // 强制刷新数据库连接
    await forceRefreshDatabaseConnection();
    
    // 获取所有预订数据（包含画集信息）
    console.log('开始查询预订数据（强制刷新后）...');
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
      .orderBy(desc(comicUniverseBookings.createdAt));

    console.log(`查询到 ${bookings.length} 条预订数据`);

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
      createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : booking.createdAt,
      updatedAt: booking.updatedAt instanceof Date ? booking.updatedAt.toISOString() : booking.updatedAt,
      confirmedAt: booking.confirmedAt instanceof Date ? booking.confirmedAt.toISOString() : booking.confirmedAt,
      completedAt: booking.completedAt instanceof Date ? booking.completedAt.toISOString() : booking.completedAt,
      cancelledAt: booking.cancelledAt instanceof Date ? booking.cancelledAt.toISOString() : booking.cancelledAt,
      collection: {
        id: booking.collectionId,
        title: booking.collectionTitle || '未知画集',
        number: booking.collectionNumber || '未知编号',
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

    // 强制刷新数据库连接，确保获取最新数据
    console.log('🔄 强制刷新API响应数据:', {
      bookingsCount: formattedBookings.length,
      stats: formattedStats,
      timestamp: new Date().toISOString(),
      refreshType: 'FORCE_REFRESH'
    });

    const response = NextResponse.json({
      bookings: formattedBookings,
      stats: formattedStats,
      _timestamp: Date.now(),
      _cacheBuster: Math.random().toString(36).substring(7),
      _refreshType: 'FORCE_REFRESH'
    });

    // 添加最强的缓存控制头，彻底防止缓存
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('X-Accel-Buffering', 'no');
    response.headers.set('X-No-Cache', 'true');
    response.headers.set('X-Refresh-Type', 'FORCE_REFRESH');
    
    // 添加时间戳确保每次响应都不同
    response.headers.set('Last-Modified', new Date().toUTCString());
    response.headers.set('ETag', `"force-refresh-${Date.now()}-${Math.random()}"`);

    console.log('🔄 强制刷新预订数据 - 完成');
    return response;

  } catch (error) {
    console.error('强制刷新获取预订管理数据失败:', error);
    return NextResponse.json(
      { message: '强制刷新获取预订管理数据失败', error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

export { GET };

// 强制API路由不缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0; 