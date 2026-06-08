import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';
import type { ScheduleTemplateInput } from '@/modules/fitnessPlan/types';

export async function GET(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const data = await fitnessPlanDbService.getOrCreateActiveScheduleTemplate(user.id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/schedule/template GET]', error);
    return NextResponse.json({ error: '获取循环模板失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const body = (await request.json()) as ScheduleTemplateInput;
    if (body.cycleWeeks != null && (body.cycleWeeks < 1 || body.cycleWeeks > 12)) {
      return NextResponse.json({ error: '循环周数需在 1–12 之间' }, { status: 400 });
    }

    const data = await fitnessPlanDbService.updateScheduleTemplate(user.id, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/schedule/template PUT]', error);
    return NextResponse.json({ error: '更新循环模板失败' }, { status: 500 });
  }
}
