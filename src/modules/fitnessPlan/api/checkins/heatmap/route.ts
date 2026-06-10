import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';

export async function GET(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const weeks = Number(request.nextUrl.searchParams.get('weeks') ?? 12);
    const safeWeeks = Number.isFinite(weeks) ? Math.min(Math.max(weeks, 4), 26) : 12;
    const data = await fitnessPlanDbService.getCheckinHeatmap(user.id, safeWeeks);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/checkins/heatmap GET]', error);
    return NextResponse.json({ error: '获取打卡热力图失败' }, { status: 500 });
  }
}
