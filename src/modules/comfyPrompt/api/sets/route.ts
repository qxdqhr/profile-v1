import { comfyPromptDbService } from '../../db/comfyPromptDbService';
import type { PromptSetFormData } from '../../types';
import { fail, ok, requireAuthUser } from '../_helpers';

export async function GET(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const data = await comfyPromptDbService.getSets(user!.id);
  return ok(data);
}

export async function POST(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const body = (await request.json()) as PromptSetFormData;
  if (!body.name?.trim()) return fail('提示词组名称不能为空', 400);
  const data = await comfyPromptDbService.createSet(user!.id, body);
  return ok(data);
}
