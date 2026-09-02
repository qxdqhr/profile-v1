import { NextRequest, NextResponse } from 'next/server';
import { listSkillIds, listSkillFiles, readTextFileById, readMeta } from '../_fileStore';

type SkillSource = 'local_cursor' | 'manual_upload' | 'remote';
type SkillStatus = 'draft' | 'published' | 'archived';

function normalizeDate(iso: string): string {
  return iso.replace('T', ' ').slice(0, 19);
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

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const q = params.get('q')?.trim().toLowerCase() || '';
    const source = params.get('source')?.trim() as SkillSource | null;
    const status = params.get('status')?.trim() as SkillStatus | null;
    const pageRaw = Number(params.get('page') || '1');
    const limitRaw = Number(params.get('limit') || '10');
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(100, Math.floor(limitRaw)) : 10;

    let skillIds: string[] = [];
    try {
      skillIds = await listSkillIds();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const maybeMissingTable =
        message.includes('does not exist') ||
        message.includes('relation') ||
        message.includes('no such table');
      if (maybeMissingTable) {
        return NextResponse.json({ items: [], total: 0, page, limit });
      }
      throw error;
    }
    const items = await Promise.all(
      skillIds.map(async (id) => {
        try {
          const files = await listSkillFiles(id);
          const skillMd = files.find((f) => f.relativePath === 'SKILL.md') || files[0];
          if (!skillMd) return null;
          const content = await readTextFileById(skillMd.id);
          const fm = parseFrontmatter(content);
          const meta = readMeta(skillMd);
          return {
            id,
            name: id,
            description: extractDescription(content),
            updatedAt: normalizeDate(skillMd.createdAt),
            tags: fm.tags,
            source: meta.source,
            status: meta.status
          };
        } catch (error) {
          console.warn(`[skill-manager] 跳过异常 skill: ${id}`, error);
          return null;
        }
      })
    );
    const compact = items.filter(Boolean) as Array<{
      id: string;
      name: string;
      description: string;
      updatedAt: string;
      tags: string[];
      source: SkillSource;
      status: SkillStatus;
    }>;

    const filtered = compact.filter((item) => {
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
