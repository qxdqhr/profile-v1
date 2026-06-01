import { getAiServerConfig } from './config';
import type { AiImageInput } from '../types';

export interface VisionChatParams {
  systemPrompt: string;
  userPrompt: string;
  images?: AiImageInput[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface VisionChatResult {
  content: string;
  model: string;
  raw: unknown;
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

export async function callOpenAiCompatibleVisionChat(
  params: VisionChatParams
): Promise<VisionChatResult> {
  const config = getAiServerConfig();
  if (!config) {
    throw new Error('AI_API_KEY 未配置');
  }

  const model = params.model || (params.images?.length ? config.visionModel : config.textModel);
  const userContent: Array<Record<string, unknown>> = [{ type: 'text', text: params.userPrompt }];

  for (const image of params.images ?? []) {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${image.mimeType};base64,${image.base64}`,
      },
    });
  }

  const payload: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: params.systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: params.temperature ?? 0.2,
  };

  if (params.maxTokens !== undefined) {
    payload.max_tokens = params.maxTokens;
  }

  if (params.jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(joinUrl(config.baseUrl, 'chat/completions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const raw = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        (raw as { error?: { message?: string } })?.error?.message ||
        `AI 请求失败 (${response.status})`;
      throw new Error(message);
    }

    const content =
      (raw as { choices?: Array<{ message?: { content?: string } }> })?.choices?.[0]?.message
        ?.content ?? '';

    return { content, model, raw };
  } finally {
    clearTimeout(timer);
  }
}
