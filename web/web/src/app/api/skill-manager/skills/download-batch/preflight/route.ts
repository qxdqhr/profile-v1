import { NextRequest, NextResponse } from 'next/server';
import { listSkillFiles } from '../../../_fileStore';

function sanitizeSkillId(raw: string): string | null {
  return /^[a-zA-Z0-9_-]+$/.test(raw) ? raw : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { ids?: string[] };
    const ids = Array.isArray(body.ids) ? body.ids : [];

    const exists: string[] = [];
    const missing: string[] = [];
    const invalid: string[] = [];

    for (const raw of ids) {
      const id = sanitizeSkillId(raw);
      if (!id) {
        invalid.push(raw);
        continue;
      }

      const files = await listSkillFiles(id);
      if (files.length > 0) exists.push(id);
      else missing.push(id);
    }

    return NextResponse.json({ ok: true, exists, missing, invalid });
  } catch (error) {
    console.error('[skill-manager] preflight failed:', error);
    return NextResponse.json({ error: '预检失败' }, { status: 500 });
  }
}
