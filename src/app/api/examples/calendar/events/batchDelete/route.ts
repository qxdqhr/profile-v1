import { NextRequest, NextResponse } from 'next/server';
import { calendarMockDb } from '@/lib/examples/calendar-mock-db';

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { eventIds } = body;
  if (!Array.isArray(eventIds)) {
    return NextResponse.json({ success: false, error: '无效的 ID 列表' }, { status: 400 });
  }
  calendarMockDb.batchDelete(eventIds);
  return NextResponse.json({ success: true, message: '批量删除成功' });
}
