import { createFileServiceConfigWithConfigManager, createUniversalFileServiceWithConfigManager } from 'sa2kit/universalFile/server';
import { UniversalFileService } from 'sa2kit/universalFile/server';
import { EnvConfigService } from '@/modules/configManager/services/envConfigService';

const globalAny = globalThis as typeof globalThis & {
  __sa2kitShowmasterpieceFileConfigProvider?: () => Promise<any>;
  __sa2kitShowmasterpieceResolveFileUrl?: (fileId: string) => Promise<string | null | undefined>;
};

if (!globalAny.__sa2kitShowmasterpieceFileConfigProvider) {
  let fileServicePromise: Promise<UniversalFileService> | null = null;

  const resolveFileUrl = async (fileId: string) => {
    if (!fileServicePromise) {
      const envConfigService = EnvConfigService.getInstance();
      const envConfig = await envConfigService.loadConfigFromDatabase();
      envConfigService.setEnvironmentVariables(envConfig);
      fileServicePromise = createUniversalFileServiceWithConfigManager();
    }
    const fileService = await fileServicePromise;
    return fileService.getFileUrl(fileId);
  };

  globalAny.__sa2kitShowmasterpieceResolveFileUrl = resolveFileUrl;

  globalAny.__sa2kitShowmasterpieceFileConfigProvider = async () => {
    const envConfigService = EnvConfigService.getInstance();
    const envConfig = await envConfigService.loadConfigFromDatabase();
    envConfigService.setEnvironmentVariables(envConfig);
    const configManager = await createFileServiceConfigWithConfigManager();
    return {
      ...configManager.getConfig(),
      resolveFileUrl,
    };
  };
}
