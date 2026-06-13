export type { AiApiSettings, AiClientSettings } from 'sa2kit/common/aiApi/client';

export {
  AI_API_SETTINGS_STORAGE_KEY,
  saveAiApiSettings,
  toClientSettings,
} from 'sa2kit/common/aiApi/client';

import type { AiApiSettings, AiClientSettings } from 'sa2kit/common/aiApi/client';
import { AI_API_SETTINGS_STORAGE_KEY } from 'sa2kit/common/aiApi/client';
import { toServerClientSettings } from './toServerClientSettings';

/** 项目默认：小米 MiMo 多模态（浏览器设置面板初始值） */
export const DEFAULT_AI_API_SETTINGS: AiApiSettings = {
  apiKey: '',
  baseUrl: 'https://api.xiaomimimo.com/v1',
  visionModel: 'mimo-v2.5',
  textModel: 'mimo-v2.5',
  audioModel: 'whisper-1',
  audioStrategy: 'auto',
};

/** 使用项目 MiMo 默认，而非 sa2kit 内置 OpenAI 默认 */
export function loadAiApiSettings(storageKey = AI_API_SETTINGS_STORAGE_KEY): AiApiSettings {
  if (typeof window === 'undefined') return DEFAULT_AI_API_SETTINGS;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return DEFAULT_AI_API_SETTINGS;
    return { ...DEFAULT_AI_API_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AI_API_SETTINGS;
  }
}

/** 仅当浏览器填写了 API Key 时才向服务端传递 clientSettings */
export function pickClientSettingsFromStorage(
  storageKey = AI_API_SETTINGS_STORAGE_KEY
): AiClientSettings | undefined {
  return toServerClientSettings(loadAiApiSettings(storageKey));
}
