import { requireAuthUser, ok, fail } from '../../_helpers';
import { nodeNotesDbService } from '../../../db/nodeNotesDbService';
import type { DocumentFormData, ViewportState } from '../../../types';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const { id } = await context.params;
  const graph = await nodeNotesDbService.getDocumentGraph(id, String(user!.id));
  if (!graph) return fail('文档不存在', 404);

  return ok(graph);
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const { id } = await context.params;
  const body = (await request.json()) as DocumentFormData & { viewport?: ViewportState | null };

  if (body.title !== undefined && !body.title.trim()) return fail('文档标题不能为空', 400);

  const doc = await nodeNotesDbService.updateDocument(id, String(user!.id), body);
  if (!doc) return fail('文档不存在', 404);

  return ok(doc);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const { id } = await context.params;
  const deleted = await nodeNotesDbService.deleteDocument(id, String(user!.id));
  if (!deleted) return fail('文档不存在', 404);

  return ok({ deleted: true });
}
