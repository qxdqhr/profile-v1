import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '../../db/fitnessPlanDbService';
import type { ExerciseFormData } from '../../types';

export async function GET(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const search = request.nextUrl.searchParams.get('search') ?? undefined;
    const type = request.nextUrl.searchParams.get('type') ?? undefined;
    const bodyPart = request.nextUrl.searchParams.get('bodyPart') ?? undefined;

    const data = await fitnessPlanDbService.listExercises(user.id, {
      search,
      type,
      bodyPart,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/exercises GET]', error);
    return NextResponse.json({ error: '获取动作列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const body = (await request.json()) as ExerciseFormData;
    if (!body.name?.trim()) {
      return NextResponse.json({ error: '动作名称不能为空' }, { status: 400 });
    }
    if (body.type !== 'strength' && body.type !== 'cardio') {
      return NextResponse.json({ error: '动作类型无效' }, { status: 400 });
    }

    const data = await fitnessPlanDbService.createExercise(user.id, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/exercises POST]', error);
    return NextResponse.json({ error: '创建动作失败' }, { status: 500 });
  }
}
