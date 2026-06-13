import type { AiClientSettings } from 'sa2kit/common/aiApi/client';
import { toClientSettings } from 'sa2kit/common/aiApi/client';
import type { AiApiSettings } from './aiSettingsCore';

/**
 * 浏览器未填写 API Key 时，完全依赖服务端环境变量（AI_API_KEY 等），
 * 避免默认 gpt-4o-mini 覆盖 YAML / env 中的 MiMo 视觉模型。
 */
export function toServerClientSettings(settings: AiApiSettings): AiClientSettings | undefined {
  if (!settings.apiKey.trim()) {
    return undefined;
  }
  return toClientSettings(settings);
}
