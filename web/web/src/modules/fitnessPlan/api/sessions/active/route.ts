import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';

export async function GET(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const data = await fitnessPlanDbService.getActiveSession(user.id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/sessions/active GET]', error);
    return NextResponse.json({ error: '获取进行中训练失败' }, { status: 500 });
  }
}
