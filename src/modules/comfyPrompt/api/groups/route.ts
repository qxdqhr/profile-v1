import { comfyPromptDbService } from '../../db/comfyPromptDbService';
import type { PromptGroupFormData } from '../../types';
import { fail, ok, requireAuthUser } from '../_helpers';

export async function GET(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const data = await comfyPromptDbService.getGroups(user!.id);
  return ok(data);
}

export async function POST(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const body = (await request.json()) as PromptGroupFormData;
  if (!body.name?.trim()) return fail('分组名称不能为空', 400);
  const data = await comfyPromptDbService.createGroup(user!.id, body);
  return ok(data);
}
