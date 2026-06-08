import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await validateApiAuth(_request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id } = await params;
    const sessionId = Number(id);
    const data = await fitnessPlanDbService.getSessionDetail(user.id, sessionId);
    if (!data) return NextResponse.json({ error: '训练不存在' }, { status: 404 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/sessions/[id] GET]', error);
    return NextResponse.json({ error: '获取训练详情失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await validateApiAuth(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id } = await params;
    const sessionId = Number(id);
    const body = (await request.json()) as { notes?: string | null };

    const data = await fitnessPlanDbService.updateSessionNotes(
      user.id,
      sessionId,
      body.notes ?? null,
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/sessions/[id] PUT]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新失败' },
      { status: 400 },
    );
  }
}
