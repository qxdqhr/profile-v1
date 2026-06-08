/**
 * ShowMasterpiece 模块 - 预订管理API路由
 *
 * - GET:  获取所有预订数据和统计信息（常规查询）
 * - POST: 强制刷新数据库连接后再查询（原 /admin/refresh，有副作用故用 POST）
 *
 * @fileoverview 预订管理API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { forceRefreshDatabaseConnection, getDatabaseConnectionStatus } from '@/db';
import type { BookingStatus } from '@/modules/showmasterpiece/types/booking';
import { isAuthFailure, requireAdmin } from '../../lib/auth';
import { bookingQueryService } from '../../lib/bookingServices';
import { handleRouteError } from '../../lib/response';
import { routeDebug } from '../../lib/routeLog';

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
  const auth = await requireAdmin(request);
  if (isAuthFailure(auth)) return auth;

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
    return handleRouteError('获取预订管理数据失败:', error, '获取预订管理数据失败');
  }
}

/**
 * POST - 强制刷新数据库连接后查询（原 /admin/refresh）
 * 使用 POST 避免有副作用的操作被代理/浏览器缓存
 */
async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthFailure(auth)) return auth;

  try {
    routeDebug('🔄 强制刷新预订数据 - 开始执行...');

    const { qqNumber, phoneNumber, status } = parseSearchParams(request);

    const connectionStatus = await getDatabaseConnectionStatus();
    routeDebug('数据库连接状态:', connectionStatus);

    await forceRefreshDatabaseConnection();

    const result = await bookingQueryService.getAdminBookings({
      qqNumber,
      phoneNumber,
      status,
      applyFiltersToStats: false,
    });

    routeDebug('🔄 强制刷新完成:', { bookingsCount: result.bookings.length });

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
    return handleRouteError('强制刷新预订数据失败:', error, '强制刷新预订数据失败');
  }
}

export { GET, POST };

export const dynamic = 'force-dynamic';
export const revalidate = 0;
