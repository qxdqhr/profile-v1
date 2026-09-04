import { createOssFileConfigManager } from 'sa2kit/common/ossFile/server';
import {
  createOssFileBootstrap,
  fileMetadata,
  fileStorageProviders,
} from 'sa2kit/common/file/server';
import type { AliyunOSSConfig } from 'sa2kit/common/universalFile/server';
import { ensureAppConfigLoaded } from '@profile/config';
import { db } from '@profile/db';

let bootstrap: ReturnType<typeof createOssFileBootstrap> | null = null;

function buildOssConfigFromAppConfig(): AliyunOSSConfig | null {
  const appConfig = ensureAppConfigLoaded();
  const oss = appConfig.storage?.aliyunOss;
  if (!oss || oss.enabled === false) return null;

  if (!oss.region || !oss.bucket || !oss.accessKeyId || !oss.accessKeySecret) {
    return null;
  }

  return {
    type: 'aliyun-oss',
    enabled: true,
    region: oss.region,
    bucket: oss.bucket,
    accessKeyId: oss.accessKeyId,
    accessKeySecret: oss.accessKeySecret,
    customDomain: oss.customDomain || undefined,
    secure: oss.secure ?? true,
    internal: oss.internal ?? false,
  };
}

export function getProfileOssFileBootstrap() {
  bootstrap ??= createOssFileBootstrap({
    loadConfigManager: async () => {
      const ossConfig = buildOssConfigFromAppConfig();
      return createOssFileConfigManager({ ossConfig, fallbackToLocal: true });
    },
    persistence: { db, fileMetadata, fileStorageProviders },
  });
  return bootstrap;
}

export async function createShowmasterpiecePersistentFileService() {
  return getProfileOssFileBootstrap().createPersistentFileService();
}
