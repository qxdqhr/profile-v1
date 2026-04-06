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
import type { BookingStatus } from 'sa2kit/showmasterpiece';
import { createBookingQueryService } from 'sa2kit/showmasterpiece/server';
import { validateApiAuth } from '@/lib/auth/legacy';

const bookingQueryService = createBookingQueryService(db);

/**
 * 获取所有预订数据和统计信息（管理员专用）
 * 
 * @param request Next.js请求对象
 * @returns 所有预订数据和统计信息
 */
async function GET(request: NextRequest) {
  const user = await validateApiAuth(request);
  if (!user) {
    return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
  }

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
    
    const result = await bookingQueryService.getAdminBookings({
      qqNumber,
      phoneNumber,
      status,
      applyFiltersToStats: true,
    });

    // 强制刷新数据库连接，确保获取最新数据
    console.log('API响应数据:', {
      bookingsCount: result.bookings.length,
      stats: result.stats,
      timestamp: new Date().toISOString(),
      forceRefresh: forceRefresh,
      searchParams: { qqNumber, phoneNumber, status }
    });

    const response = NextResponse.json({
      bookings: result.bookings,
      stats: result.stats,
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
