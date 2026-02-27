import { NextRequest, NextResponse } from 'next/server';
import { getExamRealtimeState, updateExamRealtimeState } from '@/modules/exam/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const state = getExamRealtimeState(sessionId);

  if (!state) {
    return NextResponse.json({ error: '会话不存在' }, { status: 404 });
  }

  return NextResponse.json(state);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await request.json().catch(() => ({}));

  const state = updateExamRealtimeState(sessionId, body.payload);
  if (!state) {
    return NextResponse.json({ error: '会话不存在' }, { status: 404 });
  }

  return NextResponse.json(state);
}
