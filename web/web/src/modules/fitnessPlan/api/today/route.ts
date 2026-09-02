import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';
import { formatDateKey } from '@/modules/fitnessPlan/types';

export async function GET(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const date = request.nextUrl.searchParams.get('date') ?? formatDateKey(new Date());
    const data = await fitnessPlanDbService.getTodayOverview(user.id, date);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/today GET]', error);
    return NextResponse.json({ error: '获取今日概览失败' }, { status: 500 });
  }
}
