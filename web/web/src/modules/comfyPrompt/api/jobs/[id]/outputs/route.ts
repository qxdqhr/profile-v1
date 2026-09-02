import { comfyPromptDbService } from '../../../../db/comfyPromptDbService';
import { fail, ok, requireAuthUser } from '../../../_helpers';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const id = Number((await params).id);
  if (!Number.isFinite(id)) return fail('无效 ID', 400);

  const body = (await request.json()) as { indices?: number[] };
  const indices = body.indices;
  if (!Array.isArray(indices) || !indices.length) {
    return fail('请指定要删除的图片索引', 400);
  }

  const updated = await comfyPromptDbService.removeJobOutputs(user!.id, id, indices);
  if (!updated) return fail('任务不存在', 404);

  return ok(updated);
}
