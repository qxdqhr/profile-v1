import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

function getSkillsRootDir(): string {
  const customDir = process.env.SKILL_MANAGER_LOCAL_DIR;
  if (customDir?.trim()) {
    return customDir;
  }
  const home = process.env.HOME || process.cwd();
  return path.join(home, '.cursor', 'skills');
}

function sanitizeSkillId(raw: string): string | null {
  return /^[a-zA-Z0-9_-]+$/.test(raw) ? raw : null;
}

function sanitizeRelativePath(raw: string): string | null {
  const normalized = raw.replaceAll('\\', '/').trim();
  if (!normalized) return null;
  if (normalized.startsWith('/')) return null;
  if (normalized.includes('..')) return null;
  return normalized;
}

function detectContentType(filePath: string): string {
  if (filePath.endsWith('.md')) return 'text/markdown; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.txt')) return 'text/plain; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params;
    const id = sanitizeSkillId(rawId);
    if (!id) {
      return NextResponse.json({ error: '非法 skill id' }, { status: 400 });
    }

    const filePathParam = new URL(request.url).searchParams.get('path') || '';
    const relativePath = sanitizeRelativePath(filePathParam);
    if (!relativePath) {
      return NextResponse.json({ error: '缺少或非法 path 参数' }, { status: 400 });
    }

    const root = getSkillsRootDir();
    const skillDir = path.join(root, id);
    const targetPath = path.join(skillDir, relativePath);
    const normalizedTarget = path.normalize(targetPath);
    const normalizedRoot = path.normalize(skillDir + path.sep);
    if (!normalizedTarget.startsWith(normalizedRoot)) {
      return NextResponse.json({ error: '非法文件路径' }, { status: 400 });
    }

    const stat = await fs.stat(targetPath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: '目标不是文件' }, { status: 400 });
    }

    const content = await fs.readFile(targetPath, 'utf-8');
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': detectContentType(relativePath)
      }
    });
  } catch (error) {
    console.error('[skill-manager] read file failed:', error);
    return NextResponse.json({ error: '读取文件失败' }, { status: 500 });
  }
}

