import { comfyPromptDbService } from '../../db/comfyPromptDbService';
import type { ServerFormData } from '../../types';
import { validateComfyBaseUrl } from '../../services/validateComfyUrl';
import { fail, ok, requireAuthUser } from '../_helpers';

export async function GET(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const data = await comfyPromptDbService.getServers(user!.id);
  return ok(data);
}

export async function POST(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const body = (await request.json()) as ServerFormData;
  if (!body.name?.trim()) return fail('请填写服务器名称', 400);
  if (!body.baseUrl?.trim()) return fail('请填写 ComfyUI 地址', 400);

  try {
    const baseUrl = validateComfyBaseUrl(body.baseUrl);
    const data = await comfyPromptDbService.createServer(user!.id, {
      ...body,
      baseUrl,
    });
    return ok(data);
  } catch (error) {
    return fail(error instanceof Error ? error.message : '无效地址', 400);
  }
}
