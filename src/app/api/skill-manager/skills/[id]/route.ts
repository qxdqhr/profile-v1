import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { validateApiAuth } from '@/lib/auth/legacy';

type SkillSource = 'local_cursor' | 'manual_upload' | 'remote';
type SkillStatus = 'draft' | 'published' | 'archived';
type SkillMeta = {
  source: SkillSource;
  status: SkillStatus;
};
type AuthUser = { role?: string } | null;

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

function sanitizeSkillId(raw: string): string | null {
  if (!/^[a-zA-Z0-9_-]+$/.test(raw)) {
    return null;
  }
  return raw;
}

function normalizeSource(source: unknown): SkillSource {
  if (source === 'manual_upload' || source === 'remote' || source === 'local_cursor') {
    return source;
  }
  return 'local_cursor';
}

function normalizeStatus(status: unknown): SkillStatus {
  if (status === 'published' || status === 'archived' || status === 'draft') {
    return status;
  }
  return 'draft';
}

function isAdminUser(user: AuthUser): boolean {
  return user?.role === 'admin' || user?.role === 'super_admin';
}

function getAllowedAdminSources(): SkillSource[] {
  const raw = process.env.SKILL_MANAGER_ADMIN_SOURCE_OPTIONS?.trim();
  if (!raw) {
    return ['local_cursor', 'manual_upload', 'remote'];
  }

  const tokens = raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  const allowed = new Set<SkillSource>();
  for (const token of tokens) {
    if (token === 'local_cursor' || token === 'manual_upload' || token === 'remote') {
      allowed.add(token);
    }
  }

  return allowed.size ? Array.from(allowed) : ['local_cursor', 'manual_upload', 'remote'];
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
    return {
      source: normalizeSource(parsed.source),
      status: normalizeStatus(parsed.status)
    };
  } catch {
    return defaultMeta();
  }
}

async function writeSkillMeta(skillDir: string, meta: SkillMeta): Promise<void> {
  const metaPath = path.join(skillDir, '.skill-meta.json');
  await fs.writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf-8');
}

function validateSkillContent(content: string): string | null {
  if (!content.trim()) {
    return 'SKILL.md 内容不能为空';
  }

  if (content.length > 500_000) {
    return 'SKILL.md 内容过大，超过 500KB';
  }

  return null;
}

async function collectFiles(baseDir: string, relativeDir = '', limit = 200): Promise<string[]> {
  const absDir = path.join(baseDir, relativeDir);
  const entries = await fs.readdir(absDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (files.length >= limit) break;

    const nextRelative = relativeDir ? path.join(relativeDir, entry.name) : entry.name;
    if (entry.isDirectory()) {
      const nested = await collectFiles(baseDir, nextRelative, limit - files.length);
      files.push(...nested);
    } else {
      files.push(nextRelative.replaceAll('\\', '/'));
    }
  }

  return files;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params;
    const id = sanitizeSkillId(rawId);
    if (!id) {
      return NextResponse.json({ error: '非法 skill id' }, { status: 400 });
    }

    const rootDir = getSkillsRootDir();
    const skillDir = path.join(rootDir, id);
    const skillMdPath = path.join(skillDir, 'SKILL.md');

    const [content, stat] = await Promise.all([fs.readFile(skillMdPath, 'utf-8'), fs.stat(skillDir)]);
    const files = await collectFiles(skillDir);
    const fm = parseFrontmatter(content);
    const meta = await readSkillMeta(skillDir);

    return NextResponse.json({
      id,
      name: id,
      description: extractDescription(content),
      updatedAt: normalizeDate(stat.mtimeMs),
      tags: fm.tags,
      source: meta.source,
      status: meta.status,
      content,
      files
    });
  } catch (error) {
    console.error('[skill-manager] detail failed:', error);
    return NextResponse.json({ error: '读取技能详情失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params;
    const id = sanitizeSkillId(rawId);
    if (!id) {
      return NextResponse.json({ error: '非法 skill id' }, { status: 400 });
    }

    const body = (await request.json()) as { content?: string; status?: SkillStatus; source?: SkillSource };
    const content = body.content ?? '';

    const validationError = validateSkillContent(content);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (body.source !== undefined) {
      const user = (await validateApiAuth(request)) as AuthUser;
      if (!user) {
        return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
      }
      if (!isAdminUser(user)) {
        return NextResponse.json({ error: 'source 仅管理员可修改' }, { status: 403 });
      }
      const allowedSources = getAllowedAdminSources();
      const nextSource = normalizeSource(body.source);
      if (!allowedSources.includes(nextSource)) {
        return NextResponse.json(
          { error: `source 不在允许范围内: ${allowedSources.join(',')}` },
          { status: 400 }
        );
      }
    }

    const rootDir = getSkillsRootDir();
    const skillDir = path.join(rootDir, id);
    const skillMdPath = path.join(skillDir, 'SKILL.md');

    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(skillMdPath, content, 'utf-8');
    const prevMeta = await readSkillMeta(skillDir);
    const nextMeta: SkillMeta = {
      source: body.source ? normalizeSource(body.source) : prevMeta.source,
      status: body.status ? normalizeStatus(body.status) : prevMeta.status
    };
    await writeSkillMeta(skillDir, nextMeta);

    const stat = await fs.stat(skillDir);
    return NextResponse.json({
      ok: true,
      id,
      updatedAt: normalizeDate(stat.mtimeMs),
      source: nextMeta.source,
      status: nextMeta.status
    });
  } catch (error) {
    console.error('[skill-manager] save failed:', error);
    return NextResponse.json({ error: '保存 Skill 失败' }, { status: 500 });
  }
}
