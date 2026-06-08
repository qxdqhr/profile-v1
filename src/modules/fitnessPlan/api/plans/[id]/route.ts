import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { fitnessPlanDbService } from '../../../db/fitnessPlanDbService';
import type { WorkoutPlanFormData, WorkoutPlanStatus } from '../../../types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await validateApiAuth(_request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id } = await params;
    const planId = Number(id);
    const data = await fitnessPlanDbService.getPlanDetail(user.id, planId);
    if (!data) return NextResponse.json({ error: '计划不存在' }, { status: 404 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/plans/[id] GET]', error);
    return NextResponse.json({ error: '获取计划详情失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await validateApiAuth(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id } = await params;
    const planId = Number(id);
    const body = (await request.json()) as Partial<WorkoutPlanFormData> & {
      status?: WorkoutPlanStatus;
    };

    const data = await fitnessPlanDbService.updatePlan(user.id, planId, body);
    if (!data) return NextResponse.json({ error: '计划不存在' }, { status: 404 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/plans/[id] PUT]', error);
    return NextResponse.json({ error: '更新计划失败' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await validateApiAuth(_request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id } = await params;
    const planId = Number(id);
    const ok = await fitnessPlanDbService.deletePlan(user.id, planId);
    if (!ok) return NextResponse.json({ error: '计划不存在' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[fitnessPlan/plans/[id] DELETE]', error);
    return NextResponse.json({ error: '删除计划失败' }, { status: 500 });
  }
}
