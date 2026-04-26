import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

function getSkillsRootDir(): string {
  const customDir = process.env.SKILL_MANAGER_LOCAL_DIR;
  if (customDir?.trim()) return customDir;
  const home = process.env.HOME || process.cwd();
  return path.join(home, '.cursor', 'skills');
}

function sanitizeSkillId(raw: string): string | null {
  return /^[a-zA-Z0-9_-]+$/.test(raw) ? raw : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { ids?: string[] };
    const ids = Array.isArray(body.ids) ? body.ids : [];
    const root = getSkillsRootDir();

    const exists: string[] = [];
    const missing: string[] = [];
    const invalid: string[] = [];

    for (const raw of ids) {
      const id = sanitizeSkillId(raw);
      if (!id) {
        invalid.push(raw);
        continue;
      }

      try {
        await fs.access(path.join(root, id));
        exists.push(id);
      } catch {
        missing.push(id);
      }
    }

    return NextResponse.json({ ok: true, exists, missing, invalid });
  } catch (error) {
    console.error('[skill-manager] preflight failed:', error);
    return NextResponse.json({ error: '预检失败' }, { status: 500 });
  }
}
