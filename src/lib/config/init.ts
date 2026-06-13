import { getAppConfig, loadAppConfig, type AppConfig } from 'sa2kit/common/config/bootstrap';
import { applyAiConfigFromYaml } from '@/lib/config/apply-ai-env';

let initialized = false;

/** 进程内单例：在 db / auth / oss 之前调用 */
export function ensureAppConfigLoaded(): AppConfig {
  if (!initialized) {
    loadAppConfig({ logDoctor: process.env.NODE_ENV !== 'test' });
    applyAiConfigFromYaml();
    initialized = true;
  }
  return getAppConfig();
}
