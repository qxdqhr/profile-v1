import { NextRequest, NextResponse } from 'next/server';
import { getApiSessionUser } from '@/lib/auth/session';
import { fitnessPlanDbService } from '../../../../db/fitnessPlanDbService';

export async function POST(request: NextRequest) {
  try {
    const user = await getApiSessionUser(request);
    if (!user) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const body = (await request.json()) as { templateId?: string; groupId?: string };

    if (body.groupId) {
      const data = await fitnessPlanDbService.copyTemplateGroup(user.id, body.groupId);
      return NextResponse.json({ success: true, data });
    }

    if (!body.templateId) {
      return NextResponse.json({ error: '缺少 templateId 或 groupId' }, { status: 400 });
    }

    const data = await fitnessPlanDbService.copyFromTemplate(user.id, body.templateId);
    if (!data) return NextResponse.json({ error: '模板不存在' }, { status: 404 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[fitnessPlan/plans/templates/copy POST]', error);
    return NextResponse.json({ error: '复制模板失败' }, { status: 500 });
  }
}
