import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { fitnessPlanDbService } from '../../db/fitnessPlanDbService';
import type { PlanItemInput, WorkoutPlanFormData, WorkoutPlanStatus } from '../../types';

export async function GET(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const status = (request.nextUrl.searchParams.get('status') ?? 'active') as WorkoutPlanStatus;
    const data = await fitnessPlanDbService.listPlans(user.id, status);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/plans GET]', error);
    return NextResponse.json({ error: '获取计划列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const body = (await request.json()) as WorkoutPlanFormData & { items?: PlanItemInput[] };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: '计划名称不能为空' }, { status: 400 });
    }

    const data = await fitnessPlanDbService.createPlan(user.id, body, body.items ?? []);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/plans POST]', error);
    return NextResponse.json({ error: '创建计划失败' }, { status: 500 });
  }
}
