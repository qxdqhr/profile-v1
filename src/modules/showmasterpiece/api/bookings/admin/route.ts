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
import { desc, sql, eq, and, like } from 'drizzle-orm';
import { BookingStatus } from '@/modules/showmasterpiece/types/booking';

/**
 * 获取所有预订数据和统计信息（管理员专用）
 * 
 * @param request Next.js请求对象
 * @returns 所有预订数据和统计信息
 */
async function GET(request: NextRequest) {
  try {
    // 强制禁用Next.js缓存
    let forceRefresh = null;
    let searchParams = new URLSearchParams();
    try {
      const url = new URL(request.url);
      searchParams = url.searchParams;
      forceRefresh = searchParams.get('forceRefresh') || searchParams.get('t');
    } catch (error) {
      // 在构建时可能会出错，忽略这个错误
      console.log('无法解析URL参数，可能是构建时调用');
    }
    
    // 获取搜索参数
    const qqNumber = searchParams.get('qqNumber');
    const phoneNumber = searchParams.get('phoneNumber');
    const statusParam = searchParams.get('status');
    const status = statusParam && statusParam !== 'all' ? statusParam as BookingStatus : null;
    
    console.log('🔍 [API/Admin] 收到搜索请求参数:', {
      allParams: Object.fromEntries(searchParams.entries()),
      extractedParams: { qqNumber, phoneNumber, status, statusParam },
      url: request.url,
      timestamp: new Date().toISOString()
    });
    
    // 如果请求包含强制刷新参数，确保不使用缓存
    if (forceRefresh) {
      console.log('强制刷新预订数据:', { forceRefresh, timestamp: new Date().toISOString() });
    }
    
    // 获取所有预订数据（包含画集信息）
    console.log('开始查询预订数据...', { qqNumber, phoneNumber, status });
    
    // 强制刷新：先执行一个简单的查询来确保连接是最新的
    if (forceRefresh) {
      console.log('执行强制刷新查询...');
      await db.execute(sql`SELECT 1 as refresh_check`);
    }
    
    // 构建查询条件
    const conditions = [];
    
    if (qqNumber) {
      conditions.push(like(comicUniverseBookings.qqNumber, `%${qqNumber}%`));
      console.log('🔍 [API/Admin] 添加QQ号搜索条件:', `%${qqNumber}%`);
    }
    
    if (phoneNumber) {
      conditions.push(like(comicUniverseBookings.phoneNumber, `%${phoneNumber}%`));
      console.log('🔍 [API/Admin] 添加手机号搜索条件:', `%${phoneNumber}%`);
    }
    
    if (status) {
      conditions.push(eq(comicUniverseBookings.status, status));
      console.log('🔍 [API/Admin] 添加状态过滤条件:', status);
    }
    
    console.log('🔍 [API/Admin] 总查询条件数量:', conditions.length);
    
    const bookings = await db
      .select({
        id: comicUniverseBookings.id,
        collectionId: comicUniverseBookings.collectionId,
        qqNumber: comicUniverseBookings.qqNumber,
        phoneNumber: comicUniverseBookings.phoneNumber,
        quantity: comicUniverseBookings.quantity,
        status: comicUniverseBookings.status,
        notes: comicUniverseBookings.notes,
        pickupMethod: comicUniverseBookings.pickupMethod,
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
      .orderBy(desc(comicUniverseBookings.createdAt));

    console.log(`查询到 ${bookings.length} 条预订数据`);
    
    // 🔍 调试：打印原始查询结果
    console.log('🔍 [API] 预订数据查询结果预览:');
    console.log(`📊 [API] 查询到 ${bookings.length} 条预订记录`);
    if (bookings.length > 0) {
      const firstBooking = bookings[0];
      console.log('🔍 [API] 第一条预订记录的原始数据:', {
        id: firstBooking.id,
        qqNumber: firstBooking.qqNumber,
        phoneNumber: firstBooking.phoneNumber,
        pickupMethod: firstBooking.pickupMethod,
        pickupMethodType: typeof firstBooking.pickupMethod,
        notes: firstBooking.notes,
        allKeys: Object.keys(firstBooking)
      });
    }

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
    const formattedBookings = bookings.map((booking, index) => {
      const formatted = {
        id: booking.id,
        collectionId: booking.collectionId,
        qqNumber: booking.qqNumber,
        phoneNumber: booking.phoneNumber,
        quantity: booking.quantity,
        status: booking.status,
        notes: booking.notes,
        pickupMethod: booking.pickupMethod, // 添加领取方式字段
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
    };

    // 添加调试信息，查看前几条记录的pickupMethod
    if (index < 3) {
      console.log(`🔍 [API] 预订记录 ${index + 1} (ID: ${booking.id}) pickupMethod 处理:`, {
        原始值: booking.pickupMethod,
        格式化后: formatted.pickupMethod,
        类型: typeof booking.pickupMethod,
      });
    }

    return formatted;
  });

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
    console.log('API响应数据:', {
      bookingsCount: formattedBookings.length,
      stats: formattedStats,
      timestamp: new Date().toISOString(),
      forceRefresh: forceRefresh,
      searchParams: { qqNumber, phoneNumber, status }
    });

    const response = NextResponse.json({
      bookings: formattedBookings,
      stats: formattedStats,
      _timestamp: Date.now(), // 添加时间戳到响应体
      _cacheBuster: Math.random().toString(36).substring(7) // 添加随机字符串
    });

    // 添加更强的缓存控制头，彻底防止缓存
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('X-Accel-Buffering', 'no');
    response.headers.set('X-No-Cache', 'true');
    
    // 添加时间戳确保每次响应都不同
    response.headers.set('Last-Modified', new Date().toUTCString());
    response.headers.set('ETag', `"${Date.now()}-${Math.random()}"`);

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

// 强制API路由不缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;
