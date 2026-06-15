import { NextRequest } from 'next/server';
import {
  ensureLessonProgressRows,
  syncWorkspaceLessonCache,
} from '@/modules/teachHub/services/teachHubDbService';
import { importWorkspaceZip } from '@/modules/teachHub/services/teachHubFileStore';
import { jsonError, jsonOk, parseWorkspaceId, requireUser, requireWorkspace } from '@/modules/teachHub/api/_helpers';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireUser(request);
  if ('response' in auth) return auth.response;

  const { id: rawId } = await context.params;
  const workspaceId = parseWorkspaceId(rawId);
  if (!workspaceId) return jsonError('非法 workspace id');

  const owned = await requireWorkspace(auth.user.id, workspaceId);
  if ('response' in owned) return owned.response;

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return jsonError('请上传 zip 文件（字段名 file）');
    }

    const name = file.name.toLowerCase();
    if (!name.endsWith('.zip')) {
      return jsonError('仅支持 .zip 格式');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await importWorkspaceZip({
      userId: auth.user.id,
      workspaceId,
      zipBuffer: buffer,
      uploaderId: auth.user.id,
    });

    if (!result.validation.ok) {
      return jsonError(
        `导入完成但工作区校验失败: ${result.validation.errors.join('; ')}`,
        422,
      );
    }

    await syncWorkspaceLessonCache(auth.user.id, workspaceId);
    await ensureLessonProgressRows(auth.user.id, workspaceId);

    return jsonOk({
      importedFiles: result.importedFiles,
      skippedFiles: result.skippedFiles,
      warnings: result.validation.warnings,
      lessonCount: result.validation.lessonCount,
    });
  } catch (error) {
    console.error('[teach-hub/workspaces/:id/import POST]', error);
    return jsonError('导入工作区失败', 500);
  }
}
