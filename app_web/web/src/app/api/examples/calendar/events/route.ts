import { NextRequest, NextResponse } from 'next/server';
import { calendarMockDb } from '@/lib/examples/calendar-mock-db';
import { requireExampleAccess } from '@/lib/examples/guard';

export async function GET(request: NextRequest) {
  const gated = await requireExampleAccess(request);
  if (gated.error) return gated.error;
  const events = calendarMockDb.getEvents(1);
  return NextResponse.json({ success: true, data: events });
}

export async function POST(request: NextRequest) {
  const gated = await requireExampleAccess(request);
  if (gated.error) return gated.error;
  const body = await request.json();
  const newEvent = calendarMockDb.addEvent({ ...body, userId: 1 });
  return NextResponse.json({ success: true, data: newEvent });
}
