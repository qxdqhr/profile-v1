import { resolveAiServerConfig } from './config';
import type { AiClientSettings } from '../utils/aiSettingsCore';
import type { AiImageInput } from '../types';
import {
  assertVisionCapableModel,
  detectVisionMessageFormat,
  toVisionApiErrorMessage,
  type VisionMessageFormat,
} from '../utils/visionMessageFormats';

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

function buildMessages(
  params: VisionChatParams,
  format: VisionMessageFormat
): Array<Record<string, unknown>> {
  const hasImages = (params.images?.length ?? 0) > 0;

  if (format === 'ollama' && hasImages) {
    return [
      { role: 'system', content: params.systemPrompt },
      {
        role: 'user',
        content: params.userPrompt,
        images: params.images!.map((image) => image.base64),
      },
    ];
  }

  const userContent: Array<Record<string, unknown>> = [
    { type: 'text', text: params.userPrompt },
  ];

  for (const image of params.images ?? []) {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${image.mimeType};base64,${image.base64}`,
      },
    });
  }

  return [
    { role: 'system', content: params.systemPrompt },
    { role: 'user', content: hasImages ? userContent : params.userPrompt },
  ];
}

export async function callOpenAiCompatibleVisionChat(
  params: VisionChatParams,
  clientSettings?: AiClientSettings
): Promise<VisionChatResult> {
  const config = resolveAiServerConfig(clientSettings);
  if (!config) {
    throw new Error('未配置 AI API Key，请在设置中填写或配置服务端环境变量');
  }

  const model = params.model || (params.images?.length ? config.visionModel : config.textModel);
  const hasImages = (params.images?.length ?? 0) > 0;
  const format = detectVisionMessageFormat(config.baseUrl);

  assertVisionCapableModel(model, {
    baseUrl: config.baseUrl,
    hasImages,
  });

  const payload: Record<string, unknown> = {
    model,
    messages: buildMessages(params, format),
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
      const rawMessage =
        (raw as { error?: { message?: string } })?.error?.message ||
        `AI 请求失败 (${response.status})`;
      throw new Error(toVisionApiErrorMessage(rawMessage, model));
    }

    const content =
      (raw as { choices?: Array<{ message?: { content?: string } }> })?.choices?.[0]?.message
        ?.content ?? '';

    return { content, model, raw };
  } finally {
    clearTimeout(timer);
  }
}
