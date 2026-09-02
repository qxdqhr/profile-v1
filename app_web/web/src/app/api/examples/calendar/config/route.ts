import { NextRequest, NextResponse } from 'next/server';
import { requireExampleAccess } from '@/lib/examples/guard';

const mockConfig = {
  firstDayOfWeek: 1,
  workingHours: {
    start: '09:00',
    end: '18:00',
  },
  timeZone: 'Asia/Shanghai',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  defaultView: 'month',
  defaultEventColor: '#3B82F6',
  weekends: true,
  eventColors: {
    blue: '#3B82F6',
    green: '#10B981',
  },
};

export async function GET(request: NextRequest) {
  const gated = await requireExampleAccess(request);
  if (gated.error) return gated.error;
  return NextResponse.json({ success: true, data: mockConfig });
}

export async function PUT(request: NextRequest) {
  const gated = await requireExampleAccess(request);
  if (gated.error) return gated.error;
  const body = await request.json();
  return NextResponse.json({
    success: true,
    data: {
      ...mockConfig,
      ...body,
      workingHours: {
        ...mockConfig.workingHours,
        ...(body.workingHours || {}),
      },
    },
  });
}
