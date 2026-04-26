import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
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

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params;
    const id = sanitizeSkillId(rawId);
    if (!id) {
      return NextResponse.json({ error: '非法 skill id' }, { status: 400 });
    }

    const root = getSkillsRootDir();
    const skillDir = path.join(root, id);
    await fs.access(skillDir);

    const { stdout } = await execFileAsync('zip', ['-r', '-', '.'], {
      cwd: skillDir,
      encoding: 'buffer',
      maxBuffer: 20 * 1024 * 1024
    });

    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="${id}.zip"`);

    return new NextResponse(stdout as Buffer, { status: 200, headers });
  } catch (error) {
    console.error('[skill-manager] download failed:', error);
    return NextResponse.json({ error: '下载失败，请确认系统已安装 zip 命令' }, { status: 500 });
  }
}
