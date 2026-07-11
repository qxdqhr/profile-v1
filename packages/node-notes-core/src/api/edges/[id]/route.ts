import { requireAuthUser, ok, fail } from '../../_helpers';
import { nodeNotesDbService } from '../../../db/nodeNotesDbService';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const { id } = await context.params;
  const body = (await request.json()) as { label?: string | null; color?: string };

  const edge = await nodeNotesDbService.updateEdge(id, String(user!.id), body);
  if (!edge) return fail('边不存在', 404);

  return ok(edge);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const { id } = await context.params;
  const deleted = await nodeNotesDbService.deleteEdge(id, String(user!.id));
  if (!deleted) return fail('边不存在', 404);

  return ok({ deleted: true });
}
