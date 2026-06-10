import { comfyPromptDbService } from '../../../db/comfyPromptDbService';
import type { PromptGroupFormData } from '../../../types';
import { fail, ok, requireAuthUser } from '../../_helpers';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const id = Number((await params).id);
  if (!Number.isFinite(id)) return fail('无效 ID', 400);
  const body = (await request.json()) as Partial<PromptGroupFormData>;
  const data = await comfyPromptDbService.updateGroup(user!.id, id, body);
  if (!data) return fail('提示词分组不存在', 404);
  return ok(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const id = Number((await params).id);
  if (!Number.isFinite(id)) return fail('无效 ID', 400);
  const deleted = await comfyPromptDbService.deleteGroup(user!.id, id);
  if (!deleted) return fail('提示词分组不存在', 404);
  return ok({ deleted: true });
}
