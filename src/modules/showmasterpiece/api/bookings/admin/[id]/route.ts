/**
 * ShowMasterpiece 模块 - 预订管理删除API路由
 * 
 * 管理员删除预订信息的API路由
 * 
 * @fileoverview 预订删除API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { comicUniverseBookings } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 删除预订
 * 
 * @param request Next.js请求对象
 * @param params 路由参数
 * @returns 删除结果
 */
async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: '无效的预订ID' },
        { status: 400 }
      );
    }

    // 检查预订是否存在
    const existingBooking = await db
      .select({ id: comicUniverseBookings.id })
      .from(comicUniverseBookings)
      .where(eq(comicUniverseBookings.id, id))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { message: '预订不存在' },
        { status: 404 }
      );
    }

    // 删除预订
    await db
      .delete(comicUniverseBookings)
      .where(eq(comicUniverseBookings.id, id));

    console.log('✅ 预订删除成功:', { bookingId: id });

    return NextResponse.json({
      message: '预订删除成功',
      bookingId: id
    });

  } catch (error) {
    console.error('删除预订失败:', error);
    return NextResponse.json(
      { message: '删除预订失败', error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

export { DELETE }; 