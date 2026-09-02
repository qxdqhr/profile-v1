import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id } = await params;
    const sessionId = Number(id);
    const body = (await request.json()) as { exerciseId?: number };

    if (!body.exerciseId) {
      return NextResponse.json({ error: '缺少 exerciseId' }, { status: 400 });
    }

    const data = await fitnessPlanDbService.addSessionExercise(
      user.id,
      sessionId,
      body.exerciseId,
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/sessions/[id]/exercises POST]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '添加动作失败' },
      { status: 400 },
    );
  }
}
