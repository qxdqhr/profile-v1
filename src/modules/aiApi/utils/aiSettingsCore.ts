export type { AiApiSettings, AiClientSettings } from 'sa2kit/common/aiApi/client';

export {
  AI_API_SETTINGS_STORAGE_KEY,
  loadAiApiSettings,
  saveAiApiSettings,
  toClientSettings,
  pickClientSettingsFromStorage,
} from 'sa2kit/common/aiApi/client';

import type { AiApiSettings } from 'sa2kit/common/aiApi/client';

/** 项目默认：小米 MiMo 多模态（浏览器设置面板初始值） */
export const DEFAULT_AI_API_SETTINGS: AiApiSettings = {
  apiKey: '',
  baseUrl: 'https://api.xiaomimimo.com/v1',
  visionModel: 'mimo-v2.5',
  textModel: 'mimo-v2.5',
  audioModel: 'whisper-1',
  audioStrategy: 'auto',
};
