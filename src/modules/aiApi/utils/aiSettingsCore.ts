export type { AiApiSettings, AiClientSettings } from 'sa2kit/common/aiApi/client';

export {
  AI_API_SETTINGS_STORAGE_KEY,
  saveAiApiSettings,
  toClientSettings,
  toServerClientSettings,
} from 'sa2kit/common/aiApi/client';

import type { AiApiSettings } from 'sa2kit/common/aiApi/client';
import {
  AI_API_SETTINGS_STORAGE_KEY,
  loadAiApiSettings as loadSa2kitAiApiSettings,
  toServerClientSettings,
} from 'sa2kit/common/aiApi/client';

/** profile-v1 默认：小米 MiMo */
export const DEFAULT_AI_API_SETTINGS: AiApiSettings = {
  apiKey: '',
  baseUrl: 'https://api.xiaomimimo.com/v1',
  visionModel: 'mimo-v2.5',
  textModel: 'mimo-v2.5',
  audioModel: 'whisper-1',
  audioStrategy: 'auto',
};

export function loadAiApiSettings(storageKey = AI_API_SETTINGS_STORAGE_KEY): AiApiSettings {
  return loadSa2kitAiApiSettings(storageKey, DEFAULT_AI_API_SETTINGS);
}

export function pickClientSettingsFromStorage(storageKey = AI_API_SETTINGS_STORAGE_KEY) {
  return toServerClientSettings(loadAiApiSettings(storageKey));
}
