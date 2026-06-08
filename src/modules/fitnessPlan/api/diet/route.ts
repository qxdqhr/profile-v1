import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';
import { formatDateKey } from '@/modules/fitnessPlan/types';

export async function GET(request: NextRequest) {
  try {
    const user = await validateApiAuth(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const date =
      request.nextUrl.searchParams.get('date') ?? formatDateKey(new Date());
    const data = await fitnessPlanDbService.getDietDay(user.id, date);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/diet GET]', error);
    return NextResponse.json({ error: '获取饮食记录失败' }, { status: 500 });
  }
}
