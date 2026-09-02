import { NextRequest, NextResponse } from 'next/server';
import { buildSkillZip, listSkillFiles } from '../../../_fileStore';

function sanitizeSkillId(raw: string): string | null {
  return /^[a-zA-Z0-9_-]+$/.test(raw) ? raw : null;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params;
    const id = sanitizeSkillId(rawId);
    if (!id) {
      return NextResponse.json({ error: '非法 skill id' }, { status: 400 });
    }

    const files = await listSkillFiles(id);
    if (!files.length) {
      return NextResponse.json({ error: 'Skill 不存在' }, { status: 404 });
    }
    const buffer = await buildSkillZip(id);

    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="${id}.zip"`);

    return new NextResponse(buffer, { status: 200, headers });
  } catch (error) {
    console.error('[skill-manager] download failed:', error);
    return NextResponse.json({ error: '下载失败' }, { status: 500 });
  }
}
