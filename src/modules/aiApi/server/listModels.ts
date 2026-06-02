import { resolveAiServerConfig } from './config';
import type { AiClientSettings } from '../utils/aiSettingsCore';
import {
  filterChatModels,
  filterVisionModels,
  pickDefaultVisionModel,
} from '../utils/modelHeuristics';

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

interface OpenAiModelListResponse {
  data?: Array<{ id?: string }>;
  models?: Array<{ id?: string } | string>;
}

function parseModelIds(raw: OpenAiModelListResponse): string[] {
  if (Array.isArray(raw.data)) {
    return raw.data.map((item) => item.id).filter((id): id is string => Boolean(id));
  }
  if (Array.isArray(raw.models)) {
    return raw.models
      .map((item) => (typeof item === 'string' ? item : item.id))
      .filter((id): id is string => Boolean(id));
  }
  return [];
}

export interface ListModelsResult {
  models: string[];
  visionModels: string[];
  suggestedVisionModel?: string;
}

export async function listOpenAiCompatibleModels(
  clientSettings?: AiClientSettings,
  currentVisionModel?: string
): Promise<ListModelsResult> {
  const config = resolveAiServerConfig(clientSettings);
  if (!config) {
    throw new Error('未配置 AI API Key，请在设置中填写或配置服务端环境变量');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(joinUrl(config.baseUrl, 'models'), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
      signal: controller.signal,
    });

    const raw = (await response.json().catch(() => ({}))) as OpenAiModelListResponse;

    if (!response.ok) {
      const message =
        (raw as { error?: { message?: string } })?.error?.message ||
        `获取模型列表失败 (${response.status})`;
      throw new Error(message);
    }

    const modelIds = parseModelIds(raw);
    if (modelIds.length === 0) {
      throw new Error('接口未返回可用模型');
    }

    const models = filterChatModels(modelIds);
    const visionModels = filterVisionModels(modelIds);
    const suggestedVisionModel = pickDefaultVisionModel(modelIds, currentVisionModel);

    return { models, visionModels, suggestedVisionModel };
  } finally {
    clearTimeout(timer);
  }
}
