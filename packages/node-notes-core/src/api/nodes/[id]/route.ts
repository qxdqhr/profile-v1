import { requireAuthUser, ok, fail } from '../../_helpers';
import { nodeNotesDbService } from '../../../db/nodeNotesDbService';
import type { NodeFormData } from '../../../types';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const { id } = await context.params;
  const body = (await request.json()) as Partial<NodeFormData>;

  const node = await nodeNotesDbService.updateNode(id, String(user!.id), body);
  if (!node) return fail('节点不存在', 404);

  return ok(node);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const { id } = await context.params;
  const deleted = await nodeNotesDbService.deleteNode(id, String(user!.id));
  if (!deleted) return fail('节点不存在', 404);

  return ok({ deleted: true });
}
