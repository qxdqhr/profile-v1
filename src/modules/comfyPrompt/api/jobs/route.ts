import { randomUUID } from 'crypto';
import { comfyPromptDbService } from '../../db/comfyPromptDbService';
import type { SubmitJobFormData } from '../../types';
import { ComfyUiClient } from '../../services/comfyUiClient';
import { injectWorkflowPrompt } from '../../services/injectWorkflowPrompt';
import { fail, ok, requireAuthUser } from '../_helpers';

export async function GET(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;
  const data = await comfyPromptDbService.getJobs(user!.id);
  return ok(data);
}

export async function POST(request: Request) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const body = (await request.json()) as SubmitJobFormData;
  if (!body.serverId) return fail('请选择 ComfyUI 服务器', 400);
  if (!body.workflowId) return fail('请选择工作流', 400);

  const server = await comfyPromptDbService.getServerById(user!.id, body.serverId);
  if (!server?.enabled) return fail('服务器不存在或已禁用', 404);

  const workflow = await comfyPromptDbService.getWorkflowById(user!.id, body.workflowId);
  if (!workflow) return fail('工作流不存在', 404);

  const clientId = randomUUID();
  let injectedWorkflow: Record<string, unknown>;

  try {
    injectedWorkflow = injectWorkflowPrompt(workflow.workflowJson, {
      positivePrompt: body.positivePrompt,
      negativePrompt: body.negativePrompt,
      positiveNodeId: workflow.positiveNodeId,
      negativeNodeId: workflow.negativeNodeId,
      seedNodeId: workflow.seedNodeId,
      seed: body.seed,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : '工作流注入失败', 400);
  }

  const job = await comfyPromptDbService.createJob(user!.id, {
    serverId: server.id,
    workflowId: workflow.id,
    clientId,
    positivePrompt: body.positivePrompt,
    negativePrompt: body.negativePrompt,
    requestJson: { prompt: injectedWorkflow, client_id: clientId },
  });

  try {
    const client = new ComfyUiClient(server.baseUrl);
    const queued = await client.queuePrompt(injectedWorkflow, clientId);
    const updated = await comfyPromptDbService.updateJob(user!.id, job.id, {
      promptId: queued.prompt_id,
      status: 'queued',
      responseJson: queued as unknown as Record<string, unknown>,
    });
    return ok(updated ?? job);
  } catch (error) {
    const message = error instanceof Error ? error.message : '提交 ComfyUI 失败';
    const updated = await comfyPromptDbService.updateJob(user!.id, job.id, {
      status: 'failed',
      errorMessage: message,
      completedAt: new Date(),
    });
    return fail(message, 502);
  }
}
