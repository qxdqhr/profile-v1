import { EnvConfigService } from '@/modules/configManager/services/envConfigService';
import { createOssFileConfigManagerFromEnv } from 'sa2kit/ossFile/server';

export async function loadEnvAndCreateOssFileConfigManager() {
  const envConfigService = EnvConfigService.getInstance();
  const envConfig = await envConfigService.loadConfigFromDatabase();
  envConfigService.setEnvironmentVariables(envConfig);
  return createOssFileConfigManagerFromEnv();
}

export async function ensureFileServiceEnvLoaded() {
  await loadEnvAndCreateOssFileConfigManager();
}
