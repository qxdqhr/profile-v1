import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '../../../db/fitnessPlanDbService';
import type { ExerciseFormData } from '../../../types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id } = await params;
    const exerciseId = Number(id);
    if (!Number.isFinite(exerciseId)) {
      return NextResponse.json({ error: '无效的动作 ID' }, { status: 400 });
    }

    const body = (await request.json()) as ExerciseFormData;
    const data = await fitnessPlanDbService.updateExercise(user.id, exerciseId, body);
    if (!data) return NextResponse.json({ error: '动作不存在或不可编辑' }, { status: 404 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/exercises PUT]', error);
    return NextResponse.json({ error: '更新动作失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id } = await params;
    const exerciseId = Number(id);
    const ok = await fitnessPlanDbService.deleteExercise(user.id, exerciseId);
    if (!ok) return NextResponse.json({ error: '动作不存在或不可删除' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[fitnessPlan/exercises DELETE]', error);
    return NextResponse.json({ error: '删除动作失败' }, { status: 500 });
  }
}
