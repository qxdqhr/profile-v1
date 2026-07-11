import { requireAuthUser, ok, fail } from '../../../_helpers';
import { nodeNotesDbService } from '../../../../db/nodeNotesDbService';
import type { NodeFormData } from '../../../../types';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const { id } = await context.params;
  const body = (await request.json()) as NodeFormData;
  if (!body.title?.trim()) return fail('节点标题不能为空', 400);

  const node = await nodeNotesDbService.createNode(id, String(user!.id), body);
  if (!node) return fail('文档不存在', 404);

  return ok(node);
}
