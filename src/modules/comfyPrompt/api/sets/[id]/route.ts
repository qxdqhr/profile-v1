import { comfyPromptDbService } from '../../../db/comfyPromptDbService';
import type { PromptSetFormData } from '../../../types';
import { fail, ok, requireAuthUser } from '../../_helpers';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const id = Number((await params).id);
  if (!Number.isFinite(id)) return fail('无效 ID', 400);
  const data = await comfyPromptDbService.getSetById(user!.id, id);
  if (!data) return fail('提示词组不存在', 404);
  return ok(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const id = Number((await params).id);
  if (!Number.isFinite(id)) return fail('无效 ID', 400);
  const body = (await request.json()) as Partial<PromptSetFormData>;
  const data = await comfyPromptDbService.updateSet(user!.id, id, body);
  if (!data) return fail('提示词组不存在', 404);
  return ok(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const id = Number((await params).id);
  if (!Number.isFinite(id)) return fail('无效 ID', 400);
  const deleted = await comfyPromptDbService.deleteSet(user!.id, id);
  if (!deleted) return fail('提示词组不存在', 404);
  return ok({ deleted: true });
}
