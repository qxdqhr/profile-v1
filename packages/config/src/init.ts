import { getAppConfig, loadAppConfig, type AppConfig } from 'sa2kit/common/config/bootstrap';
import { applyAiConfigFromYaml } from './apply-ai-env';
import { findMonorepoRoot } from './repo-root';

let initialized = false;
const monorepoRoot = findMonorepoRoot();

/** 进程内单例：在 db / auth / oss 之前调用 */
export function ensureAppConfigLoaded(): AppConfig {
  if (!initialized) {
    loadAppConfig({ logDoctor: process.env.NODE_ENV !== 'test', cwd: monorepoRoot });
    applyAiConfigFromYaml();
    initialized = true;
  }
  return getAppConfig();
}
