import { NextRequest, NextResponse } from 'next/server';
import { verifyCronSecret } from '@/modules/ticketMonitor/api/lib/auth';
import { syncTicketMonitorEvents } from '@/modules/ticketMonitor/server/syncEvents';

export async function POST(request: NextRequest) {
  const unauthorized = verifyCronSecret(request);
  if (unauthorized) return unauthorized;

  const result = await syncTicketMonitorEvents();

  return NextResponse.json({
    success: true,
    data: result,
  });
}
