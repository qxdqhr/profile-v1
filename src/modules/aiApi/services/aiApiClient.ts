import type { AiApiResponse, AiApiRunRequest, AiClientSettings } from 'sa2kit/common/aiApi';
import {
  AiApiClientError,
  type AiApiClientOptions,
} from 'sa2kit/common/aiApi/client';
import { pickClientSettingsFromStorage } from '../utils/aiSettingsCore';

export { AiApiClientError };

function resolveClientSettings(
  options?: { clientSettings?: AiClientSettings }
): AiClientSettings | undefined {
  if (options !== undefined && 'clientSettings' in options) {
    return options.clientSettings;
  }
  return pickClientSettingsFromStorage();
}

/**
 * 通过 HTTP 调用 AI 任务入口。
 * 显式传入 clientSettings: undefined 时完全依赖服务端 YAML/env，不回退 localStorage。
 */
export async function runAiTask<TInput, TOutput>(
  taskId: string,
  input: TInput,
  options?: {
    signal?: AbortSignal;
    clientSettings?: AiClientSettings;
    runEndpoint?: string;
    fetchImpl?: typeof fetch;
  }
): Promise<AiApiResponse<TOutput>> {
  const fetchFn = options?.fetchImpl ?? fetch;
  const endpoint = options?.runEndpoint ?? '/api/ai/run';
  const clientSettings = resolveClientSettings(options);

  const payload: AiApiRunRequest<TInput> = {
    taskId,
    input,
    ...(clientSettings ? { clientSettings } : {}),
  };

  const response = await fetchFn(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: options?.signal,
  });

  return (await response.json()) as AiApiResponse<TOutput>;
}

export async function runAiTaskOrThrow<TInput, TOutput>(
  taskId: string,
  input: TInput,
  options?: {
    signal?: AbortSignal;
    clientSettings?: AiClientSettings;
    runEndpoint?: string;
    fetchImpl?: typeof fetch;
  }
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

export function createAiTaskRunner<TInput, TOutput>(
  taskId: string,
  options?: AiApiClientOptions
) {
  return (
    input: TInput,
    runOptions?: { signal?: AbortSignal; clientSettings?: AiClientSettings }
  ) =>
    runAiTaskOrThrow<TInput, TOutput>(taskId, input, {
      ...runOptions,
      runEndpoint: options?.runEndpoint,
      fetchImpl: options?.fetchImpl,
    });
}

export const aiApiClient = {
  run: runAiTask,
  runOrThrow: runAiTaskOrThrow,
  createRunner: createAiTaskRunner,
};
