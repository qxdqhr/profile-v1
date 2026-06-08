import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { fitnessPlanDbService } from '@/modules/fitnessPlan/db/fitnessPlanDbService';
import type { DietEntryUpdateInput } from '@/modules/fitnessPlan/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await validateApiAuth(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id } = await context.params;
    const entryId = Number(id);
    if (!Number.isFinite(entryId)) {
      return NextResponse.json({ error: '无效的记录 ID' }, { status: 400 });
    }

    const body = (await request.json()) as DietEntryUpdateInput;
    const data = await fitnessPlanDbService.updateDietEntry(user.id, entryId, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/diet/entries PUT]', error);
    const message = error instanceof Error ? error.message : '更新饮食记录失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await validateApiAuth(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id } = await context.params;
    const entryId = Number(id);
    if (!Number.isFinite(entryId)) {
      return NextResponse.json({ error: '无效的记录 ID' }, { status: 400 });
    }

    const data = await fitnessPlanDbService.deleteDietEntry(user.id, entryId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/diet/entries DELETE]', error);
    const message = error instanceof Error ? error.message : '删除饮食记录失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
