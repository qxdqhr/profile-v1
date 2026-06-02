import type { AiClientSettings } from '../utils/aiSettingsCore';
import type { AiModelsListResponse } from '../types/models';

export async function fetchAiModels(
  clientSettings?: AiClientSettings,
  options?: { signal?: AbortSignal }
): Promise<AiModelsListResponse> {
  const response = await fetch('/api/ai/models', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientSettings }),
    signal: options?.signal,
  });

  return (await response.json()) as AiModelsListResponse;
}
