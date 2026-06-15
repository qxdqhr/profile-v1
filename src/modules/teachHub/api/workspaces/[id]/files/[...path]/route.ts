import { NextRequest, NextResponse } from 'next/server';
import {
  putWorkspaceFileText,
  readWorkspaceFileText,
  repairWorkspaceSeedFilesIfMissing,
} from '@/modules/teachHub/services/teachHubFileStore';
import { getWorkspaceForUser, updateWorkspaceMeta } from '@/modules/teachHub/services/teachHubDbService';
import {
  contentTypeForPath,
  rewriteTeachHtmlLinks,
  shouldRewriteHtml,
} from '@/modules/teachHub/utils/htmlLinkRewriter';
import { extractMissionWhySummary } from '@/modules/teachHub/utils/missionParser';
import { sanitizeRelativePath } from '@/modules/teachHub/utils/teachWorkspacePaths';
import { jsonError, parseWorkspaceId, requireUser, requireWorkspace } from '@/modules/teachHub/api/_helpers';

type RouteContext = { params: Promise<{ id: string; path: string[] }> };

function joinPath(segments: string[]): string | null {
  if (!segments.length) return null;
  return sanitizeRelativePath(segments.join('/'));
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;

  const { id: rawId, path } = await context.params;
  const workspaceId = parseWorkspaceId(rawId);
  if (!workspaceId) return jsonError('非法 workspace id');

  const owned = await requireWorkspace(auth.user.id, workspaceId);
  if ('response' in owned) return owned.response;

  const relativePath = joinPath(path);
  if (!relativePath) return jsonError('非法文件路径');

  try {
    const workspace = await getWorkspaceForUser(auth.user.id, workspaceId);
    if (workspace) {
      await repairWorkspaceSeedFilesIfMissing(auth.user.id, workspace);
    }

    let content = await readWorkspaceFileText(auth.user.id, workspaceId, relativePath);
    const params = new URL(request.url).searchParams;
    const raw = params.get('raw') === '1';

    if (!raw && shouldRewriteHtml(relativePath)) {
      content = rewriteTeachHtmlLinks(content, workspaceId);
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentTypeForPath(relativePath),
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '读取文件失败';
    if (message.includes('不存在')) {
      return jsonError(message, 404);
    }
    console.error('[teach-hub/workspaces/:id/files/* GET]', error);
    return jsonError('读取文件失败', 500);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;

  const { id: rawId, path } = await context.params;
  const workspaceId = parseWorkspaceId(rawId);
  if (!workspaceId) return jsonError('非法 workspace id');

  const owned = await requireWorkspace(auth.user.id, workspaceId);
  if ('response' in owned) return owned.response;

  const relativePath = joinPath(path);
  if (!relativePath) return jsonError('非法文件路径');

  if (relativePath.endsWith('.html')) {
    return jsonError('不支持通过 API 直接覆盖 HTML 课时，请使用生成下一课', 400);
  }

  try {
    const body = (await request.json()) as { content?: string };
    if (typeof body.content !== 'string') {
      return jsonError('content 必须为字符串');
    }

    await putWorkspaceFileText({
      userId: auth.user.id,
      workspaceId,
      relativePath,
      content: body.content,
      uploaderId: auth.user.id,
    });

    if (relativePath === 'MISSION.md') {
      const summary = extractMissionWhySummary(body.content);
      await updateWorkspaceMeta(auth.user.id, workspaceId, { missionSummary: summary });
    }

    return NextResponse.json({ success: true, data: { relativePath } });
  } catch (error) {
    console.error('[teach-hub/workspaces/:id/files/* PUT]', error);
    return jsonError('写入文件失败', 500);
  }
}
