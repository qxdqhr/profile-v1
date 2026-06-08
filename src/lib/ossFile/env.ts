import { EnvConfigService } from '@/modules/configManager/services/envConfigService';
import {
  createOssFileBootstrap,
  createOssFileConfigManagerFromEnv,
  fileMetadata,
  fileStorageProviders,
} from 'sa2kit/ossFile/server';
import { db } from '@/db';

let bootstrap: ReturnType<typeof createOssFileBootstrap> | null = null;

export function getProfileOssFileBootstrap() {
  bootstrap ??= createOssFileBootstrap({
    loadConfigManager: async () => {
      const envConfigService = EnvConfigService.getInstance();
      const envConfig = await envConfigService.loadConfigFromDatabase();
      envConfigService.setEnvironmentVariables(envConfig);
      return createOssFileConfigManagerFromEnv();
    },
    persistence: { db, fileMetadata, fileStorageProviders },
  });
  return bootstrap;
}

export async function loadEnvAndCreateOssFileConfigManager() {
  return getProfileOssFileBootstrap().getConfigManager();
}

export async function ensureFileServiceEnvLoaded() {
  await loadEnvAndCreateOssFileConfigManager();
}

export async function createProfilePersistentFileService() {
  return getProfileOssFileBootstrap().createPersistentFileService();
}

export async function createProfileFileService() {
  return getProfileOssFileBootstrap().createFileService();
}
