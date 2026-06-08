import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { fitnessPlanDbService } from '../../../../db/fitnessPlanDbService';
import type { PlanItemInput } from '../../../types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await validateApiAuth(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id } = await params;
    const planId = Number(id);
    const body = (await request.json()) as { items: PlanItemInput[] };

    if (!Array.isArray(body.items)) {
      return NextResponse.json({ error: 'items 必须是数组' }, { status: 400 });
    }

    const data = await fitnessPlanDbService.setPlanItems(user.id, planId, body.items);
    if (!data) return NextResponse.json({ error: '计划不存在' }, { status: 404 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/plans/[id]/items PUT]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '保存编排失败' },
      { status: 500 },
    );
  }
}
