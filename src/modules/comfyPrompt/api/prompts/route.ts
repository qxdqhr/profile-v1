import { comfyPromptDbService } from '../../db/comfyPromptDbService';
import type { PromptFormData, PromptKind } from '../../types';
import { fail, ok, requireAuthUser } from '../_helpers';

export async function GET(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get('kind') as PromptKind | null;
  const data = await comfyPromptDbService.getPrompts(user!.id, kind || undefined);
  return ok(data);
}

export async function POST(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const body = (await request.json()) as PromptFormData;
  if (!body.title?.trim()) return fail('标题不能为空', 400);
  if (!body.content?.trim()) return fail('提示词内容不能为空', 400);
  const data = await comfyPromptDbService.createPrompt(user!.id, body);
  return ok(data);
}
