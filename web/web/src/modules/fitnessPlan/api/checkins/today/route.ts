import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '../../../db/fitnessPlanDbService';

export async function GET(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const dateParam = request.nextUrl.searchParams.get('date');
    const date = dateParam ? new Date(`${dateParam}T12:00:00`) : new Date();
    const data = await fitnessPlanDbService.getTodayCheckins(user.id, date);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/checkins/today GET]', error);
    return NextResponse.json({ error: '获取打卡状态失败' }, { status: 500 });
  }
}
