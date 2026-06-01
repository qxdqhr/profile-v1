import type { AiClientSettings } from '../utils/aiSettingsCore';

export interface AiServerConfig {
  apiKey: string;
  baseUrl: string;
  visionModel: string;
  textModel: string;
  timeoutMs: number;
  maxImageBytes: number;
}

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_VISION_MODEL = 'gpt-4o-mini';
const DEFAULT_TEXT_MODEL = 'gpt-4o-mini';

export function resolveAiServerConfig(client?: AiClientSettings): AiServerConfig | null {
  const envApiKey =
    process.env.AI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim() || '';
  const apiKey = client?.apiKey?.trim() || envApiKey;
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl:
      client?.baseUrl?.trim() ||
      process.env.AI_BASE_URL?.trim() ||
      DEFAULT_BASE_URL,
    visionModel:
      client?.visionModel?.trim() ||
      process.env.AI_VISION_MODEL?.trim() ||
      DEFAULT_VISION_MODEL,
    textModel:
      client?.textModel?.trim() ||
      process.env.AI_TEXT_MODEL?.trim() ||
      DEFAULT_TEXT_MODEL,
    timeoutMs: Number(process.env.AI_TIMEOUT_MS || 60000),
    maxImageBytes: Number(process.env.AI_MAX_IMAGE_BYTES || 5 * 1024 * 1024),
  };
}

/** @deprecated 使用 resolveAiServerConfig */
export function getAiServerConfig(): AiServerConfig | null {
  return resolveAiServerConfig();
}
