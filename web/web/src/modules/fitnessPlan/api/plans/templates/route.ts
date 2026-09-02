import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { PLAN_TEMPLATES } from '../../../data/planTemplates';

export async function GET(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    return NextResponse.json({ success: true, data: PLAN_TEMPLATES });
  } catch (error) {
    console.error('[fitnessPlan/plans/templates GET]', error);
    return NextResponse.json({ error: '获取模板失败' }, { status: 500 });
  }
}
