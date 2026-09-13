import {
  createOssFileBootstrap,
  fileMetadata,
  fileStorageProviders,
  uploadFileAndResolveAccessUrl,
} from 'sa2kit/common/file/server';
import { createOssFileConfigManager } from 'sa2kit/common/ossFile/server';
import type { AliyunOSSConfig } from 'sa2kit/common/universalFile/server';
import { ensureAppConfigLoaded } from '@profile/config';
import { db } from '@profile/db';
import { DietUploadError, type DietUploadResult } from 'sa2kit/business/fitnessPlan/server';

const MODULE_ID = 'fitnessPlan';
const OSS_STORAGE_KEY = 'aliyun-oss';

function assertOssPublicUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new DietUploadError('上传成功但未获得有效的 OSS 访问地址', 'INVALID_URL');
  }

  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/public/')) {
    throw new DietUploadError('禁止将饮食截图保存到本地目录，请配置阿里云 OSS', 'INVALID_URL');
  }

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    throw new DietUploadError('饮食截图必须使用 OSS 公网地址，当前返回了本地路径', 'INVALID_URL');
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new DietUploadError('饮食截图访问地址无效', 'INVALID_URL');
    }
  } catch {
    throw new DietUploadError('饮食截图访问地址无效', 'INVALID_URL');
  }

  return trimmed;
}

function validateOssConfig(config: AliyunOSSConfig | undefined): AliyunOSSConfig {
  if (!config || config.type !== 'aliyun-oss') {
    throw new DietUploadError(
      '未配置阿里云 OSS，请在 config/app.config.local.yaml 的 storage.aliyunOss 中填写后再上传饮食截图',
      'OSS_NOT_CONFIGURED',
    );
  }

  const missing = [
    !config.region && 'region',
    !config.bucket && 'bucket',
    !config.accessKeyId && 'accessKeyId',
    !config.accessKeySecret && 'accessKeySecret',
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new DietUploadError(
      `阿里云 OSS 配置不完整（缺少 ${missing.join(', ')}），无法上传饮食截图`,
      'OSS_NOT_CONFIGURED',
    );
  }

  if (config.enabled === false) {
    throw new DietUploadError('阿里云 OSS 未启用，无法上传饮食截图', 'OSS_NOT_CONFIGURED');
  }

  return {
    ...config,
    enabled: true,
    type: 'aliyun-oss',
  };
}

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

let bootstrap: ReturnType<typeof createOssFileBootstrap> | null = null;

function getOssBootstrap() {
  bootstrap ??= createOssFileBootstrap({
    loadConfigManager: async () => {
      const ossConfig = buildOssConfigFromAppConfig();
      return createOssFileConfigManager({ ossConfig, fallbackToLocal: true });
    },
    persistence: { db, fileMetadata, fileStorageProviders },
  });
  return bootstrap;
}

async function createOssFileService() {
  const configManager = await getOssBootstrap().getConfigManager();
  const config = configManager.getConfig();
  validateOssConfig(config.storageProviders[OSS_STORAGE_KEY] as AliyunOSSConfig);
  return getOssBootstrap().createPersistentFileService();
}

export async function uploadDietImageToOss(input: {
  file: File;
  userId: string | number;
}): Promise<DietUploadResult> {
  const userId = String(input.userId);
  const fileService = await createOssFileService();

  try {
    const { fileId, accessUrl } = await uploadFileAndResolveAccessUrl(
      fileService,
      {
        file: input.file,
        moduleId: MODULE_ID,
        businessId: userId,
        customPath: `${MODULE_ID}/diet/${userId}`,
        metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
          originalFileName: input.file.name,
          purpose: 'diet-screenshot',
        },
      },
      userId,
    );

    return {
      imageUrl: assertOssPublicUrl(accessUrl),
      fileId,
    };
  } catch (error) {
    if (error instanceof DietUploadError) throw error;
    const message = error instanceof Error ? error.message : '未知错误';
    throw new DietUploadError(`饮食截图上传到 OSS 失败：${message}`, 'UPLOAD_FAILED');
  }
}
