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

export function getAiServerConfig(): AiServerConfig | null {
  const apiKey =
    process.env.AI_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    '';

  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: process.env.AI_BASE_URL?.trim() || DEFAULT_BASE_URL,
    visionModel: process.env.AI_VISION_MODEL?.trim() || DEFAULT_VISION_MODEL,
    textModel: process.env.AI_TEXT_MODEL?.trim() || DEFAULT_TEXT_MODEL,
    timeoutMs: Number(process.env.AI_TIMEOUT_MS || 60000),
    maxImageBytes: Number(process.env.AI_MAX_IMAGE_BYTES || 5 * 1024 * 1024),
  };
}
