import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';

interface RouteParams {
  params: Promise<{ id: string; itemId: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiSessionUser(_request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { itemId } = await params;
    const sessionItemId = Number(itemId);
    const data = await fitnessPlanDbService.addWorkoutSet(user.id, sessionItemId);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/sessions/items/[itemId]/sets POST]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '添加组失败' },
      { status: 400 },
    );
  }
}
