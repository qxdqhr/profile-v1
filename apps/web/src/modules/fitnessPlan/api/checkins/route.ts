import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';
import type { ManualCheckinInput } from '@/modules/fitnessPlan/types';
import { formatDateKey } from '@/modules/fitnessPlan/types';

export async function POST(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const body = (await request.json()) as ManualCheckinInput;
    if (body.type !== 'daily' && body.type !== 'weight') {
      return NextResponse.json({ error: '打卡类型无效' }, { status: 400 });
    }

    const data = await fitnessPlanDbService.createManualCheckin(user.id, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/checkins POST]', error);
    const message = error instanceof Error ? error.message : '打卡失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const date = request.nextUrl.searchParams.get('date') ?? formatDateKey(new Date());
    const type = request.nextUrl.searchParams.get('type');
    if (type !== 'daily' && type !== 'weight') {
      return NextResponse.json({ error: '仅可撤销综合日或体重打卡' }, { status: 400 });
    }

    const data = await fitnessPlanDbService.removeManualCheckin(user.id, date, type);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/checkins DELETE]', error);
    return NextResponse.json({ error: '撤销打卡失败' }, { status: 500 });
  }
}
