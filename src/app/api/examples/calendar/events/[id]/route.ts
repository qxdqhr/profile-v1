import { NextRequest, NextResponse } from 'next/server';
import { calendarMockDb } from '@/lib/examples/calendar-mock-db';

type RouteContext = { params: Promise<{ id: string }> };

async function resolveRouteContext(context: RouteContext) {
  return { params: await context.params };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { params } = await resolveRouteContext(context);
  const event = calendarMockDb.getEvent(parseInt(params.id, 10));
  if (!event) {
    return NextResponse.json({ success: false, error: '未找到事件' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: event });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { params } = await resolveRouteContext(context);
  const body = await request.json();
  const updatedEvent = calendarMockDb.updateEvent(parseInt(params.id, 10), body);
  if (!updatedEvent) {
    return NextResponse.json({ success: false, error: '更新失败' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: updatedEvent });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { params } = await resolveRouteContext(context);
  calendarMockDb.deleteEvent(parseInt(params.id, 10));
  return NextResponse.json({ success: true, message: '删除成功' });
}
