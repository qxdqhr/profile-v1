import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { fitnessPlanDbService } from '../../../../db/fitnessPlanDbService';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await validateApiAuth(_request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id } = await params;
    const planId = Number(id);
    const data = await fitnessPlanDbService.copyPlan(user.id, planId);
    if (!data) return NextResponse.json({ error: '计划不存在' }, { status: 404 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/plans/[id]/copy POST]', error);
    return NextResponse.json({ error: '复制计划失败' }, { status: 500 });
  }
}
