import { comfyPromptDbService } from '../../../db/comfyPromptDbService';
import { refreshJobFromComfy } from '../../../services/jobRefresh';
import { fail, ok, requireAuthUser } from '../../_helpers';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const id = Number((await params).id);
  if (!Number.isFinite(id)) return fail('无效 ID', 400);

  let job = await comfyPromptDbService.getJobById(user!.id, id);
  if (!job) return fail('任务不存在', 404);

  job = await refreshJobFromComfy(user!.id, job);
  return ok(job);
}
