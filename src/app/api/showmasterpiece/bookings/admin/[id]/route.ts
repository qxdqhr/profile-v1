/**
 * ShowMasterpiece 模块 - 预订管理删除API路由
 * 
 * 管理员删除预订信息的API路由
 * 
 * @fileoverview 预订删除API路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { BookingCommandError, createBookingCommandService } from 'sa2kit/showmasterpiece/server';
import { validateApiAuth } from '@/lib/auth/legacy';

const bookingCommandService = createBookingCommandService(db);

/**
 * 删除预订
 * 
 * @param request Next.js请求对象
 * @param params 路由参数
 * @returns 删除结果
 */
async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await validateApiAuth(request);
  if (!user) {
    return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的预订ID' },
        { status: 400 }
      );
    }

    await bookingCommandService.deleteBooking(id);

    console.log('✅ 预订删除成功:', { bookingId: id });

    return NextResponse.json({
      message: '预订删除成功',
      bookingId: id
    });

  } catch (error) {
    if (error instanceof BookingCommandError) {
      const status = error.code === 'BOOKING_NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    console.error('删除预订失败:', error);
    return NextResponse.json(
      { error: '删除预订失败' },
      { status: 500 }
    );
  }
}

export { DELETE }; 
