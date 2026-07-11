import { requireAuthUser, ok, fail } from '../../_helpers';
import {
  importMarkdownFiles,
  importZipPackage,
  isZipBuffer,
} from '../../../utils/importDocument';
import type { ImportMode } from '../../../types';

export async function POST(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const formData = await request.formData();
  const mode = (formData.get('mode') as ImportMode) || 'new-document';
  const targetDocumentId = (formData.get('targetDocumentId') as string) || undefined;
  const userId = String(user!.id);

  const fileEntries = formData.getAll('files');
  const buffers: Array<{ name: string; buffer: Buffer }> = [];

  for (const entry of fileEntries) {
    if (!(entry instanceof File)) continue;
    const buffer = Buffer.from(await entry.arrayBuffer());
    buffers.push({ name: entry.name, buffer });
  }

  if (buffers.length === 0) {
    const single = formData.get('file');
    if (single instanceof File) {
      buffers.push({
        name: single.name,
        buffer: Buffer.from(await single.arrayBuffer()),
      });
    }
  }

  if (buffers.length === 0) return fail('请上传文件', 400);

  try {
    if (buffers.length === 1 && isZipBuffer(buffers[0].buffer)) {
      const result = await importZipPackage(userId, buffers[0].buffer, mode, targetDocumentId);
      return ok(result);
    }

    if (mode !== 'merge' || !targetDocumentId) {
      return fail('多个 Markdown 文件导入需要指定目标文档（merge 模式）', 400);
    }

    const nodesCreated = await importMarkdownFiles(userId, targetDocumentId, buffers);
    return ok({ documentId: targetDocumentId, nodesCreated, edgesCreated: 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '导入失败';
    return fail(message, 400);
  }
}
