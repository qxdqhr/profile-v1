import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const examType = body.examType || 'default';
  const userId = body.userId || 'anonymous';

  return NextResponse.json({
    sessionId: nanoid(12),
    examType,
    userId,
    socketReady: false,
    message: 'Socket session metadata prepared. WS gateway wiring is pending.',
  });
}
