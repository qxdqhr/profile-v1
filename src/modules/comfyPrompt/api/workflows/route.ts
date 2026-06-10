import { comfyPromptDbService } from '../../db/comfyPromptDbService';
import type { WorkflowFormData } from '../../types';
import { fail, ok, requireAuthUser } from '../_helpers';

export async function GET(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const data = await comfyPromptDbService.getWorkflows(user!.id);
  return ok(data);
}

export async function POST(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const body = (await request.json()) as WorkflowFormData;
  if (!body.name?.trim()) return fail('工作流名称不能为空', 400);
  if (!body.workflowJson || typeof body.workflowJson !== 'object') {
    return fail('工作流 JSON 无效', 400);
  }
  const data = await comfyPromptDbService.createWorkflow(user!.id, body);
  return ok(data);
}
