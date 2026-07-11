import { requireAuthUser, ok, fail } from '../../../_helpers';
import { nodeNotesDbService } from '../../../../db/nodeNotesDbService';
import type { EdgeFormData } from '../../../../types';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const { id } = await context.params;
  const body = (await request.json()) as EdgeFormData;

  if (!body.sourceId || !body.targetId) return fail('sourceId 与 targetId 必填', 400);
  if (body.sourceId === body.targetId) return fail('不能创建自环有向边', 400);

  const edge = await nodeNotesDbService.createEdge(id, String(user!.id), body);
  if (!edge) return fail('无法创建边（文档不存在、节点无效或边已存在）', 400);

  return ok(edge);
}
