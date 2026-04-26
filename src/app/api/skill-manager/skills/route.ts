import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

type SkillSource = 'local_cursor' | 'manual_upload' | 'remote';
type SkillStatus = 'draft' | 'published' | 'archived';
type SkillMeta = {
  source: SkillSource;
  status: SkillStatus;
};

function getSkillsRootDir(): string {
  const customDir = process.env.SKILL_MANAGER_LOCAL_DIR;
  if (customDir?.trim()) {
    return customDir;
  }

  const home = process.env.HOME || process.cwd();
  return path.join(home, '.cursor', 'skills');
}

function normalizeDate(timeMs: number): string {
  return new Date(timeMs).toISOString().replace('T', ' ').slice(0, 19);
}

function extractDescription(content: string): string {
  const frontmatter = parseFrontmatter(content);
  if (frontmatter.description) {
    return frontmatter.description;
  }

  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => Boolean(line) && !line.startsWith('#'));

  return lines[0] || '暂无描述';
}

function parseFrontmatter(content: string): { description: string; tags: string[] } {
  if (!content.startsWith('---\n')) {
    return { description: '', tags: [] };
  }

  const endIndex = content.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    return { description: '', tags: [] };
  }

  const fmText = content.slice(4, endIndex);
  let description = '';
  let tags: string[] = [];

  for (const line of fmText.split('\n')) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key === 'description') {
      description = value;
    }
    if (key === 'tags' && value) {
      tags = value.split(',').map((x) => x.trim()).filter(Boolean);
    }
  }

  return { description, tags };
}

async function safeReadSkillMd(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function defaultMeta(): SkillMeta {
  return {
    source: 'local_cursor',
    status: 'draft'
  };
}

async function readSkillMeta(skillDir: string): Promise<SkillMeta> {
  try {
    const metaPath = path.join(skillDir, '.skill-meta.json');
    const content = await fs.readFile(metaPath, 'utf-8');
    const parsed = JSON.parse(content) as Partial<SkillMeta>;
    const source: SkillSource =
      parsed.source === 'manual_upload' || parsed.source === 'remote' || parsed.source === 'local_cursor'
        ? parsed.source
        : 'local_cursor';
    const status: SkillStatus =
      parsed.status === 'published' || parsed.status === 'archived' || parsed.status === 'draft'
        ? parsed.status
        : 'draft';
    return { source, status };
  } catch {
    return defaultMeta();
  }
}

export async function GET(request: NextRequest) {
  try {
    const rootDir = getSkillsRootDir();
    const params = new URL(request.url).searchParams;
    const q = params.get('q')?.trim().toLowerCase() || '';
    const source = params.get('source')?.trim() as SkillSource | null;
    const status = params.get('status')?.trim() as SkillStatus | null;
    const pageRaw = Number(params.get('page') || '1');
    const limitRaw = Number(params.get('limit') || '10');
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(100, Math.floor(limitRaw)) : 10;

    const dirEntries = await fs.readdir(rootDir, { withFileTypes: true });
    const skillDirs = dirEntries.filter((entry) => entry.isDirectory());

    const items = await Promise.all(
      skillDirs.map(async (entry) => {
        const id = entry.name;
        const skillDir = path.join(rootDir, id);
        const skillMdPath = path.join(skillDir, 'SKILL.md');
        const content = await safeReadSkillMd(skillMdPath);
        const stat = await fs.stat(skillDir);
        const fm = parseFrontmatter(content);
        const meta = await readSkillMeta(skillDir);

        return {
          id,
          name: id,
          description: extractDescription(content),
          updatedAt: normalizeDate(stat.mtimeMs),
          tags: fm.tags,
          source: meta.source,
          status: meta.status
        };
      })
    );

    const filtered = items.filter((item) => {
      if (source && source !== 'all' && item.source !== source) {
        return false;
      }
      if (status && status !== 'all' && item.status !== status) {
        return false;
      }
      if (!q) return true;
      const content = `${item.id} ${item.name} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
      return content.includes(q);
    });

    filtered.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return NextResponse.json({
      items: paged,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('[skill-manager] list failed:', error);
    return NextResponse.json({ items: [], total: 0, page: 1, limit: 10, error: '读取技能目录失败' }, { status: 500 });
  }
}
