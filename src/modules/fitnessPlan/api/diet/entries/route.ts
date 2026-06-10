import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';
import type { DietEntryInput } from '@/modules/fitnessPlan/types';

export async function POST(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const body = (await request.json()) as DietEntryInput;
    if (!body.logDate || !body.mealType || !body.foodName?.trim()) {
      return NextResponse.json({ error: '请填写餐次和名称' }, { status: 400 });
    }

    const data = await fitnessPlanDbService.addDietEntry(user.id, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/diet/entries POST]', error);
    const message = error instanceof Error ? error.message : '添加饮食记录失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
