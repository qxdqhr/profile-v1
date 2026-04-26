import { NextRequest, NextResponse } from 'next/server';
import { buildBatchZip } from '../../_fileStore';

function sanitizeSkillId(raw: string): string | null {
  return /^[a-zA-Z0-9_-]+$/.test(raw) ? raw : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { ids?: string[] };
    const ids = Array.isArray(body.ids) ? body.ids : [];
    const sanitized = ids.map(sanitizeSkillId).filter(Boolean) as string[];

    if (!sanitized.length) {
      return NextResponse.json({ error: '请至少选择一个 skill' }, { status: 400 });
    }

    const stdout = await buildBatchZip(sanitized);

    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', 'attachment; filename="skills-batch.zip"');
    return new NextResponse(stdout, { status: 200, headers });
  } catch (error) {
    console.error('[skill-manager] batch download failed:', error);
    return NextResponse.json({ error: '批量下载失败' }, { status: 500 });
  }
}
