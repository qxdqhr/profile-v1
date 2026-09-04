import { existsSync, readFileSync } from 'node:fs';
import { resolveAppConfigPath } from 'sa2kit/common/config/bootstrap';
import { parse as parseYaml } from 'yaml';
import { findMonorepoRoot } from './repo-root';

export interface AiYamlConfig {
  apiKey?: string;
  baseUrl?: string;
  visionModel?: string;
  textModel?: string;
  audioModel?: string;
}

function setEnvIfEmpty(key: string, value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return;
  if (process.env[key]?.trim()) return;
  process.env[key] = trimmed;
}

/** 从 app.config.*.yaml 的 ai 节同步到 process.env（供 sa2kit aiApi 读取） */
export function applyAiConfigFromYaml(configPath?: string): AiYamlConfig | null {
  const path = configPath ?? resolveAppConfigPath({ cwd: findMonorepoRoot() });
  if (!existsSync(path)) return null;

  let doc: { ai?: AiYamlConfig };
  try {
    doc = parseYaml(readFileSync(path, 'utf8')) as { ai?: AiYamlConfig };
  } catch {
    return null;
  }

  const ai = doc.ai;
  if (!ai) return null;

  setEnvIfEmpty('AI_API_KEY', ai.apiKey);
  setEnvIfEmpty('AI_BASE_URL', ai.baseUrl);
  setEnvIfEmpty('AI_VISION_MODEL', ai.visionModel);
  setEnvIfEmpty('AI_TEXT_MODEL', ai.textModel);
  setEnvIfEmpty('AI_AUDIO_MODEL', ai.audioModel);

  return ai;
}
