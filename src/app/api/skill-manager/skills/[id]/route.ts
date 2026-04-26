import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth/legacy';
import { parseSkillFrontmatter, validateSkillMarkdownContent } from '@/modules/skillManager/services/skillMarkdown';
import { getSkillFileByRelativePath, listSkillFiles, readMeta, readTextFileById, uploadSkillFile } from '../../_fileStore';

type SkillSource = 'local_cursor' | 'manual_upload' | 'remote';
type SkillStatus = 'draft' | 'published' | 'archived';
type AuthUser = { role?: string; id?: string } | null;

function normalizeDate(iso: string): string {
  return iso.replace('T', ' ').slice(0, 19);
}

function extractDescription(content: string): string {
  const parsed = parseSkillFrontmatter(content);
  if (parsed.data.description) return parsed.data.description;
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => Boolean(line) && !line.startsWith('#'));
  return lines[0] || '暂无描述';
}

function parseFrontmatter(content: string): { description: string; tags: string[] } {
  const parsed = parseSkillFrontmatter(content);
  const tags = parsed.data.tags
    ? parsed.data.tags
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    : [];
  return { description: parsed.data.description, tags };
}

function sanitizeSkillId(raw: string): string | null {
  return /^[a-zA-Z0-9_-]+$/.test(raw) ? raw : null;
}

function normalizeSource(source: unknown): SkillSource {
  return source === 'manual_upload' || source === 'remote' || source === 'local_cursor' ? source : 'manual_upload';
}

function normalizeStatus(status: unknown): SkillStatus {
  return status === 'published' || status === 'archived' || status === 'draft' ? status : 'draft';
}

function isAdminUser(user: AuthUser): boolean {
  return user?.role === 'admin' || user?.role === 'super_admin';
}

function getAllowedAdminSources(): SkillSource[] {
  const raw = process.env.SKILL_MANAGER_ADMIN_SOURCE_OPTIONS?.trim();
  if (!raw) return ['local_cursor', 'manual_upload', 'remote'];
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

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params;
    const id = sanitizeSkillId(rawId);
    if (!id) return NextResponse.json({ error: '非法 skill id' }, { status: 400 });

    const files = await listSkillFiles(id);
    const skillMd = files.find((f) => f.relativePath === 'SKILL.md') || files[0];
    if (!skillMd) return NextResponse.json({ error: 'Skill 不存在' }, { status: 404 });

    const content = await readTextFileById(skillMd.id);
    const fm = parseFrontmatter(content);
    const meta = readMeta(skillMd);
    return NextResponse.json({
      id,
      name: id,
      description: extractDescription(content),
      updatedAt: normalizeDate(skillMd.createdAt),
      tags: fm.tags,
      source: meta.source,
      status: meta.status,
      content,
      files: files.map((x) => x.relativePath)
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
    if (!id) return NextResponse.json({ error: '非法 skill id' }, { status: 400 });

    const body = (await request.json()) as { content?: string; status?: SkillStatus; source?: SkillSource };
    const content = body.content ?? '';
    const validationError = validateSkillMarkdownContent(content);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    if (body.source !== undefined) {
      const user = (await validateApiAuth(request)) as AuthUser;
      if (!user) return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
      if (!isAdminUser(user)) return NextResponse.json({ error: 'source 仅管理员可修改' }, { status: 403 });
      const allowedSources = getAllowedAdminSources();
      const nextSource = normalizeSource(body.source);
      if (!allowedSources.includes(nextSource)) {
        return NextResponse.json({ error: `source 不在允许范围内: ${allowedSources.join(',')}` }, { status: 400 });
      }
    }

    const prevSkillMd = await getSkillFileByRelativePath(id, 'SKILL.md');
    const prevMeta = prevSkillMd ? readMeta(prevSkillMd) : { source: 'manual_upload' as SkillSource, status: 'draft' as SkillStatus };
    const nextMeta = {
      source: body.source ? normalizeSource(body.source) : prevMeta.source,
      status: body.status ? normalizeStatus(body.status) : prevMeta.status
    };
    const uploader = (await validateApiAuth(request)) as AuthUser;
    const uploaded = await uploadSkillFile({
      skillId: id,
      relativePath: 'SKILL.md',
      content,
      source: nextMeta.source,
      status: nextMeta.status,
      uploaderId: uploader?.id ? String(uploader.id) : 'unknown'
    });

    return NextResponse.json({
      ok: true,
      id,
      updatedAt: normalizeDate(new Date().toISOString()),
      source: nextMeta.source,
      status: nextMeta.status,
      fileId: uploaded.fileId,
      accessUrl: uploaded.accessUrl
    });
  } catch (error) {
    console.error('[skill-manager] save failed:', error);
    return NextResponse.json({ error: '保存 Skill 失败' }, { status: 500 });
  }
}
