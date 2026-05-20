/**
 * ShowMasterpiece 模块 - 批量预订API路由
 * 
 * 处理批量预订相关的HTTP请求
 * 
 * @fileoverview 批量预订API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { BookingCommandError } from 'sa2kit/showmasterpiece/server';
import { bookingCommandService } from '../../lib/bookingServices';
import { apiError, logRouteError } from '../../lib/response';

/**
 * 批量预订
 * 
 * @param request Next.js请求对象
 * @returns 批量预订结果
 */
async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await bookingCommandService.batchCreateBookings(body);
    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    if (error instanceof BookingCommandError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    logRouteError('批量预订失败:', error);
    return apiError('批量预订失败', 500);
  }
}

export { POST }; 
