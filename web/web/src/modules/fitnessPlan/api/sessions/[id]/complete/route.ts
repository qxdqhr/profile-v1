import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';
import type { CompleteWorkoutInput } from '@/modules/fitnessPlan/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id } = await params;
    const sessionId = Number(id);
    const body = (await request.json()) as CompleteWorkoutInput;

    if (body.status !== 'completed' && body.status !== 'abandoned') {
      return NextResponse.json({ error: 'status 无效' }, { status: 400 });
    }

    const data = await fitnessPlanDbService.completeSession(user.id, sessionId, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/sessions/[id]/complete POST]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '结束训练失败' },
      { status: 400 },
    );
  }
}
