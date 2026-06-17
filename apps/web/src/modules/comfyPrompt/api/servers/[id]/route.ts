import { comfyPromptDbService } from '../../../db/comfyPromptDbService';
import type { ServerFormData } from '../../../types';
import { validateComfyBaseUrl } from '../../../services/validateComfyUrl';
import { fail, ok, requireAuthUser } from '../../_helpers';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const id = Number((await params).id);
  if (!Number.isFinite(id)) return fail('无效 ID', 400);

  const body = (await request.json()) as Partial<ServerFormData>;
  const patch: Partial<ServerFormData> = { ...body };

  if (body.baseUrl !== undefined) {
    try {
      patch.baseUrl = validateComfyBaseUrl(body.baseUrl);
    } catch (error) {
      return fail(error instanceof Error ? error.message : '无效地址', 400);
    }
  }

  const data = await comfyPromptDbService.updateServer(user!.id, id, patch);
  if (!data) return fail('服务器不存在', 404);
  return ok(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const id = Number((await params).id);
  if (!Number.isFinite(id)) return fail('无效 ID', 400);

  const deleted = await comfyPromptDbService.deleteServer(user!.id, id);
  if (!deleted) return fail('服务器不存在', 404);
  return ok({ deleted: true });
}
