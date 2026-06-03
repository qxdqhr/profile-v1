export interface AiApiSettings {
  apiKey: string;
  baseUrl: string;
  visionModel: string;
}

/** 请求时可携带的客户端 AI 配置（不含空字段） */
export interface AiClientSettings {
  apiKey?: string;
  baseUrl?: string;
  visionModel?: string;
  textModel?: string;
}

export const DEFAULT_AI_API_SETTINGS: AiApiSettings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  visionModel: 'gpt-4o-mini',
};

export const AI_API_SETTINGS_STORAGE_KEY = 'ai-api-settings';

export function loadAiApiSettings(): AiApiSettings {
  if (typeof window === 'undefined') return DEFAULT_AI_API_SETTINGS;
  try {
    const raw = localStorage.getItem(AI_API_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_AI_API_SETTINGS;
    return { ...DEFAULT_AI_API_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AI_API_SETTINGS;
  }
}

export function saveAiApiSettings(settings: AiApiSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AI_API_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function toClientSettings(settings: AiApiSettings): AiClientSettings | undefined {
  const client: AiClientSettings = {};
  if (settings.apiKey.trim()) client.apiKey = settings.apiKey.trim();
  if (settings.baseUrl.trim()) client.baseUrl = settings.baseUrl.trim();
  const model = settings.visionModel.trim();
  if (model) {
    // 设置页仅暴露一个模型字段，文本与多模态请求共用所选模型
    client.visionModel = model;
    client.textModel = model;
  }
  return Object.keys(client).length > 0 ? client : undefined;
}

export function pickClientSettingsFromStorage(): AiClientSettings | undefined {
  return toClientSettings(loadAiApiSettings());
}
