import { NextResponse } from 'next/server';
import { ticketMonitorDb } from '@/modules/ticketMonitor/db/ticketMonitorDbService';

export async function GET() {
  const latest = await ticketMonitorDb.getLatestSyncRun();

  return NextResponse.json({
    success: true,
    data: latest,
  });
}
