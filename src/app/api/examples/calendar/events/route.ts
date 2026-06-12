import { NextRequest, NextResponse } from 'next/server';
import { calendarMockDb } from '@/lib/examples/calendar-mock-db';

export async function GET(_request: NextRequest) {
  const events = calendarMockDb.getEvents(1);
  return NextResponse.json({ success: true, data: events });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const newEvent = calendarMockDb.addEvent({ ...body, userId: 1 });
  return NextResponse.json({ success: true, data: newEvent });
}
