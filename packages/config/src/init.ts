import { getAppConfig, loadAppConfig, type AppConfig } from 'sa2kit/common/config/bootstrap';
import { applyAiConfigFromYaml } from './apply-ai-env';
import { findMonorepoRoot } from './repo-root';

let initialized = false;

function resolveConfigLoadOptions() {
  const explicitPath = process.env.APP_CONFIG_PATH?.trim();
  if (explicitPath) {
    return { cwd: process.cwd(), explicitPath };
  }
  return { cwd: findMonorepoRoot() };
}

/** 进程内单例：在 db / auth / oss 之前调用 */
export function ensureAppConfigLoaded(): AppConfig {
  if (!initialized) {
    loadAppConfig({
      logDoctor: process.env.NODE_ENV !== 'test',
      ...resolveConfigLoadOptions(),
    });
    applyAiConfigFromYaml();
    initialized = true;
  }
  return getAppConfig();
}
