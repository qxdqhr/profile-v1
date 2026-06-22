/**
 * ShowMasterpiece 模块 - 预订信息导出API路由
 * 
 * 管理员导出预订信息为CSV格式的API路由
 * 
 * @fileoverview 预订导出API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthFailure, requireAdmin } from '../../../lib/auth';
import { bookingQueryService } from '../../../lib/bookingServices';
import { apiError, logRouteError } from '../../../lib/response';
import { routeDebug } from '../../../lib/routeLog';

/**
 * 导出预订数据为CSV格式
 * 
 * @param request Next.js请求对象
 * @returns CSV文件响应
 */
async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    
    if (format !== 'csv') {
      return NextResponse.json(
        { error: '目前只支持CSV格式导出' },
        { status: 400 }
      );
    }

    const csvContent = await bookingQueryService.exportBookingsCsv();
    
    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    
    // 使用英文文件名避免字符编码问题
    const fileName = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    
    routeDebug('✅ 预订数据导出成功', { format: 'csv' });

    return new NextResponse(csvContent, {
      status: 200,
      headers,
    });

  } catch (error) {
    logRouteError('导出预订数据失败:', error);
    return apiError('导出预订数据失败', 500);
  }
}

export { GET };
