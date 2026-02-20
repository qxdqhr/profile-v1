/**
 * ShowMasterpiece 模块 - 预订管理强制刷新API路由
 * 
 * 专门用于强制刷新预订数据的API，绕过所有缓存机制
 * 
 * @fileoverview 预订管理强制刷新API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, forceRefreshDatabaseConnection, getDatabaseConnectionStatus } from '@/db';
import type { BookingStatus } from 'sa2kit/showmasterpiece';
import { createBookingQueryService } from 'sa2kit/showmasterpiece/server';

const bookingQueryService = createBookingQueryService(db);

/**
 * 强制刷新获取所有预订数据和统计信息（管理员专用）
 * 
 * @param request Next.js请求对象
 * @returns 所有预订数据和统计信息
 */
async function GET(request: NextRequest) {
  try {
    console.log('🔄 强制刷新预订数据 - 开始执行...');
    
    // 获取搜索参数
    let searchParams = new URLSearchParams();
    try {
      const url = new URL(request.url);
      searchParams = url.searchParams;
    } catch (error) {
      console.log('无法解析URL参数，可能是构建时调用');
    }
    
    const qqNumber = searchParams.get('qqNumber');
    const phoneNumber = searchParams.get('phoneNumber');
    const statusParam = searchParams.get('status');
    const status = statusParam && statusParam !== 'all' ? statusParam as BookingStatus : null;
    
    console.log('🔍 [API/Refresh] 收到搜索请求参数:', {
      allParams: Object.fromEntries(searchParams.entries()),
      extractedParams: { qqNumber, phoneNumber, status, statusParam },
      url: request.url,
      timestamp: new Date().toISOString()
    });
    
    // 检查数据库连接状态
    const connectionStatus = await getDatabaseConnectionStatus();
    console.log('数据库连接状态:', connectionStatus);
    
    // 强制刷新数据库连接
    await forceRefreshDatabaseConnection();
    
    const result = await bookingQueryService.getAdminBookings({
      qqNumber,
      phoneNumber,
      status,
      applyFiltersToStats: false,
    });

    // 强制刷新数据库连接，确保获取最新数据
    console.log('🔄 强制刷新API响应数据:', {
      bookingsCount: result.bookings.length,
      stats: result.stats,
      timestamp: new Date().toISOString(),
      refreshType: 'FORCE_REFRESH'
    });

    const response = NextResponse.json({
      bookings: result.bookings,
      stats: result.stats,
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
