import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';
import type { UpdateWorkoutSetInput } from '@/modules/fitnessPlan/types';

interface RouteParams {
  params: Promise<{ setId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { setId } = await params;
    const body = (await request.json()) as UpdateWorkoutSetInput;
    const data = await fitnessPlanDbService.updateWorkoutSet(user.id, Number(setId), body);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/sessions/sets/[setId] PUT]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新组记录失败' },
      { status: 400 },
    );
  }
}
