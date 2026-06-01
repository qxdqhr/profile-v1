import type { AiApiResponse, AiApiRunRequest } from '../types';
import { pickClientSettingsFromStorage } from '../utils/aiSettingsCore';

export class AiApiClientError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly response?: AiApiResponse
  ) {
    super(message);
    this.name = 'AiApiClientError';
  }
}

export async function runAiTask<TInput, TOutput>(
  taskId: string,
  input: TInput,
  options?: { signal?: AbortSignal; clientSettings?: AiApiRunRequest['clientSettings'] }
): Promise<AiApiResponse<TOutput>> {
  const clientSettings =
    options?.clientSettings ?? pickClientSettingsFromStorage();

  const payload: AiApiRunRequest<TInput> = {
    taskId,
    input,
    ...(clientSettings ? { clientSettings } : {}),
  };

  const response = await fetch('/api/ai/run', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: options?.signal,
  });

  const data = (await response.json()) as AiApiResponse<TOutput>;
  return data;
}

export async function runAiTaskOrThrow<TInput, TOutput>(
  taskId: string,
  input: TInput,
  options?: { signal?: AbortSignal; clientSettings?: AiApiRunRequest['clientSettings'] }
): Promise<TOutput> {
  const result = await runAiTask<TInput, TOutput>(taskId, input, options);
  if (!result.success || result.data === undefined) {
    throw new AiApiClientError(
      result.error?.message ?? 'AI 任务失败',
      result.error?.code,
      result
    );
  }
  return result.data;
}

export function createAiTaskRunner<TInput, TOutput>(taskId: string) {
  return (input: TInput, options?: { signal?: AbortSignal }) =>
    runAiTaskOrThrow<TInput, TOutput>(taskId, input, options);
}

export const aiApiClient = {
  run: runAiTask,
  runOrThrow: runAiTaskOrThrow,
  createRunner: createAiTaskRunner,
};
