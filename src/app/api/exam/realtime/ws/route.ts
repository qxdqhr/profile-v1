import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      error: 'WebSocket gateway is not enabled in Next route handler runtime yet.',
      nextStep: 'Attach dedicated ws gateway (node server/edge worker) and bridge to modules/exam/server/realtimeService.',
    },
    { status: 501 }
  );
}
