import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';
import type { ScheduleOverrideInput } from '@/modules/fitnessPlan/types';

export async function PUT(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const body = (await request.json()) as ScheduleOverrideInput;
    if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return NextResponse.json({ error: 'date 格式应为 YYYY-MM-DD' }, { status: 400 });
    }

    await fitnessPlanDbService.setScheduleOverride(user.id, body);
    const month = body.date.slice(0, 7);
    const data = await fitnessPlanDbService.getMonthSchedule(user.id, month);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/schedule/overrides PUT]', error);
    return NextResponse.json({ error: '更新单日排期失败' }, { status: 500 });
  }
}
