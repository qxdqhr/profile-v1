import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';
import type { StartWorkoutInput } from '@/modules/fitnessPlan/types';

export async function GET(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const data = await fitnessPlanDbService.listSessions(user.id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/sessions GET]', error);
    return NextResponse.json({ error: '获取训练记录失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const body = (await request.json()) as StartWorkoutInput;
    const data = await fitnessPlanDbService.startSession(user.id, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/sessions POST]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '开始训练失败' },
      { status: 400 },
    );
  }
}
