/**
 * ShowMasterpiece 模块 - 预订信息导出API路由
 * 
 * 管理员导出预订信息为CSV格式的API路由
 * 
 * @fileoverview 预订导出API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { createBookingQueryService } from 'sa2kit/showmasterpiece/server';
import { validateApiAuth } from '@/lib/auth/legacy';

const bookingQueryService = createBookingQueryService(db);

/**
 * 导出预订数据为CSV格式
 * 
 * @param request Next.js请求对象
 * @returns CSV文件响应
 */
async function GET(request: NextRequest) {
  const user = await validateApiAuth(request);
  if (!user) {
    return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    
    if (format !== 'csv') {
      return NextResponse.json(
        { message: '目前只支持CSV格式导出' },
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
    
    console.log('✅ 预订数据导出成功:', { 
      format: 'csv',
      timestamp: new Date().toISOString()
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('导出预订数据失败:', error);
    
    // 更详细的错误信息
    let errorMessage = '导出预订数据失败';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { error: '导出预订数据失败' },
      { status: 500 }
    );
  }
}

export { GET };
