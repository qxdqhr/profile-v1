import { NextRequest, NextResponse } from 'next/server';
import { createExamRealtimeSession } from '@/modules/exam/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const examType = body.examType || 'default';
  const userId = body.userId || 'anonymous';

  const session = createExamRealtimeSession(examType);

  return NextResponse.json({
    ...session,
    userId,
    socketReady: false,
    message: 'Socket session metadata prepared. WS gateway wiring is pending.',
  });
}
