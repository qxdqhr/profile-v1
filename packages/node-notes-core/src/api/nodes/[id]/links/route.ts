import { requireAuthUser, ok, fail } from '../../../_helpers';
import { nodeNotesDbService } from '../../../../db/nodeNotesDbService';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const { id } = await context.params;
  const links = await nodeNotesDbService.getNodeLinks(id, String(user!.id));
  if (!links) return fail('节点不存在', 404);

  return ok(links);
}
