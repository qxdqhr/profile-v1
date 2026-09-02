import { NextRequest, NextResponse } from 'next/server';
import { calendarMockDb } from '@/lib/examples/calendar-mock-db';
import { requireExampleAccess } from '@/lib/examples/guard';

export async function DELETE(request: NextRequest) {
  const gated = await requireExampleAccess(request);
  if (gated.error) return gated.error;
  const body = await request.json();
  const { eventIds } = body;
  if (!Array.isArray(eventIds)) {
    return NextResponse.json({ success: false, error: '无效的 ID 列表' }, { status: 400 });
  }
  calendarMockDb.batchDelete(eventIds);
  return NextResponse.json({ success: true, message: '批量删除成功' });
}
