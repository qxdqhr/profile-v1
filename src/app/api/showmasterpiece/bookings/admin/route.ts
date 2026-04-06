/**
 * ShowMasterpiece 模块 - 预订管理API路由
 *
 * - GET:  获取所有预订数据和统计信息（常规查询）
 * - POST: 强制刷新数据库连接后再查询（原 /admin/refresh，有副作用故用 POST）
 *
 * @fileoverview 预订管理API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, forceRefreshDatabaseConnection, getDatabaseConnectionStatus } from '@/db';
import type { BookingStatus } from 'sa2kit/showmasterpiece';
import { createBookingQueryService } from 'sa2kit/showmasterpiece/server';
import { validateApiAuth } from '@/lib/auth/legacy';

const bookingQueryService = createBookingQueryService(db);

/** 解析通用查询参数 */
function parseSearchParams(request: NextRequest) {
  let searchParams = new URLSearchParams();
  try {
    searchParams = new URL(request.url).searchParams;
  } catch {
    // 构建时可能报错，忽略
  }
  const qqNumber = searchParams.get('qqNumber');
  const phoneNumber = searchParams.get('phoneNumber');
  const statusParam = searchParams.get('status');
  const status = statusParam && statusParam !== 'all' ? statusParam as BookingStatus : null;
  return { qqNumber, phoneNumber, status, searchParams };
}

/**
 * GET - 获取所有预订数据和统计信息（管理员专用，常规查询）
 */
async function GET(request: NextRequest) {
  const user = await validateApiAuth(request);
  if (!user) {
    return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
  }

  try {
    const { qqNumber, phoneNumber, status } = parseSearchParams(request);

    const result = await bookingQueryService.getAdminBookings({
      qqNumber,
      phoneNumber,
      status,
      applyFiltersToStats: true,
    });

    const response = NextResponse.json({
      bookings: result.bookings,
      stats: result.stats,
      _timestamp: Date.now(),
    });

    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('获取预订管理数据失败:', error);
    return NextResponse.json({ error: '获取预订管理数据失败' }, { status: 500 });
  }
}

/**
 * POST - 强制刷新数据库连接后查询（原 /admin/refresh）
 * 使用 POST 避免有副作用的操作被代理/浏览器缓存
 */
async function POST(request: NextRequest) {
  const user = await validateApiAuth(request);
  if (!user) {
    return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
  }

  try {
    console.log('🔄 强制刷新预订数据 - 开始执行...');

    const { qqNumber, phoneNumber, status } = parseSearchParams(request);

    const connectionStatus = await getDatabaseConnectionStatus();
    console.log('数据库连接状态:', connectionStatus);

    await forceRefreshDatabaseConnection();

    const result = await bookingQueryService.getAdminBookings({
      qqNumber,
      phoneNumber,
      status,
      applyFiltersToStats: false,
    });

    console.log('🔄 强制刷新完成:', { bookingsCount: result.bookings.length });

    const response = NextResponse.json({
      bookings: result.bookings,
      stats: result.stats,
      _timestamp: Date.now(),
      _refreshType: 'FORCE_REFRESH',
    });

    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('强制刷新预订数据失败:', error);
    return NextResponse.json({ error: '强制刷新预订数据失败' }, { status: 500 });
  }
}

export { GET, POST };

export const dynamic = 'force-dynamic';
export const revalidate = 0;
