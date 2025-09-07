/**
 * ShowMasterpiece 模块 - 预订信息导出API路由
 * 
 * 管理员导出预订信息为CSV格式的API路由
 * 
 * @fileoverview 预订导出API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { comicUniverseBookings, comicUniverseCollections } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 导出预订数据为CSV格式
 * 
 * @param request Next.js请求对象
 * @returns CSV文件响应
 */
async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    
    if (format !== 'csv') {
      return NextResponse.json(
        { message: '目前只支持CSV格式导出' },
        { status: 400 }
      );
    }

    // 获取所有预订数据，包含画集信息
    const bookings = await db
      .select({
        id: comicUniverseBookings.id,
        qqNumber: comicUniverseBookings.qqNumber,
        phoneNumber: comicUniverseBookings.phoneNumber,
        collectionId: comicUniverseBookings.collectionId,
        status: comicUniverseBookings.status,
        quantity: comicUniverseBookings.quantity,
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
        collectionPrice: comicUniverseCollections.price,
      })
      .from(comicUniverseBookings)
      .leftJoin(comicUniverseCollections, eq(comicUniverseBookings.collectionId, comicUniverseCollections.id))
      .orderBy(comicUniverseBookings.createdAt);

    console.log('数据库查询成功，预订数量:', bookings.length);

    // 生成CSV内容
    const csvContent = generateCSV(bookings);
    
    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    
    // 使用英文文件名避免字符编码问题
    const fileName = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    
    console.log('✅ 预订数据导出成功:', { 
      bookingCount: bookings.length,
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
      { 
        message: '导出预订数据失败', 
        error: errorMessage,
        details: error instanceof Error ? error.stack : '未知错误'
      },
      { status: 500 }
    );
  }
}

/**
 * 生成CSV内容
 * 
 * @param bookings 预订数据
 * @returns CSV字符串
 */
function generateCSV(bookings: any[]): string {
  // CSV头部
  const headers = [
    '预订ID',
    'QQ号',
    '手机号',
    '画集ID',
    '画集标题',
    '画集编号',
    '画集价格',
    '预订状态',
    '预订数量',
    '用户备注',
    '领取方式',
    '管理员备注',
    '创建时间',
    '更新时间',
    '确认时间',
    '完成时间',
    '取消时间'
  ];

  // 状态映射
  const statusMap: Record<string, string> = {
    'pending': '待确认',
    'confirmed': '已确认',
    'completed': '已完成',
    'cancelled': '已取消'
  };

  // 格式化时间
  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleString('zh-CN');
  };

  // 生成CSV行
  const rows = bookings.map(booking => [
    booking.id,
    booking.qqNumber || '',
    booking.phoneNumber || '',
    booking.collectionId,
    booking.collectionTitle || '',
    booking.collectionNumber || '',
    booking.collectionPrice || '',
    statusMap[booking.status] || booking.status,
    booking.quantity,
    booking.notes || '',
    booking.pickupMethod || '',
    booking.adminNotes || '',
    formatTime(booking.createdAt),
    formatTime(booking.updatedAt),
    formatTime(booking.confirmedAt),
    formatTime(booking.completedAt),
    formatTime(booking.cancelledAt)
  ]);

  // 添加BOM以确保Excel正确识别中文
  const BOM = '\uFEFF';
  
  // 组合CSV内容
  const csvContent = BOM + 
    headers.join(',') + '\n' +
    rows.map(row => 
      row.map(cell => {
        // 处理包含逗号、引号或换行符的单元格
        const cellStr = String(cell || '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');

  return csvContent;
}

export { GET }; 