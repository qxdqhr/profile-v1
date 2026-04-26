import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

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
  const tempBase = await fs.mkdtemp(path.join(os.tmpdir(), 'skill-manager-batch-'));
  try {
    const body = (await request.json()) as { ids?: string[] };
    const ids = Array.isArray(body.ids) ? body.ids : [];
    const sanitized = ids.map(sanitizeSkillId).filter(Boolean) as string[];

    if (!sanitized.length) {
      return NextResponse.json({ error: '请至少选择一个 skill' }, { status: 400 });
    }

    const root = getSkillsRootDir();
    for (const id of sanitized) {
      const src = path.join(root, id);
      try {
        await fs.access(src);
      } catch {
        continue;
      }
      const dst = path.join(tempBase, id);
      await fs.cp(src, dst, { recursive: true });
    }

    const { stdout } = await execFileAsync('zip', ['-r', '-', '.'], {
      cwd: tempBase,
      encoding: 'buffer',
      maxBuffer: 80 * 1024 * 1024
    });

    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', 'attachment; filename="skills-batch.zip"');
    return new NextResponse(stdout as Buffer, { status: 200, headers });
  } catch (error) {
    console.error('[skill-manager] batch download failed:', error);
    return NextResponse.json({ error: '批量下载失败，请确认系统已安装 zip 命令' }, { status: 500 });
  } finally {
    await fs.rm(tempBase, { recursive: true, force: true });
  }
}
