import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';

export async function GET(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const month = request.nextUrl.searchParams.get('month');
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'month 参数格式应为 YYYY-MM' }, { status: 400 });
    }

    const data = await fitnessPlanDbService.getMonthSchedule(user.id, month);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/schedule GET]', error);
    return NextResponse.json({ error: '获取日历排期失败' }, { status: 500 });
  }
}
