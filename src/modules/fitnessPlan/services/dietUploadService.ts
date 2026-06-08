import {
  uploadFileAndResolveAccessUrl,
  type AliyunOSSConfig,
} from 'sa2kit/ossFile/server';
import {
  createProfilePersistentFileService,
  loadEnvAndCreateOssFileConfigManager,
} from '@/lib/ossFile/env';

const MODULE_ID = 'fitnessPlan';
const OSS_STORAGE_KEY = 'aliyun-oss';

export class DietUploadError extends Error {
  constructor(
    message: string,
    readonly code: 'OSS_NOT_CONFIGURED' | 'INVALID_URL' | 'UPLOAD_FAILED',
  ) {
    super(message);
    this.name = 'DietUploadError';
  }
}

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
      '未配置阿里云 OSS，请在配置管理中填写 ALIYUN_OSS_* 后再上传饮食截图',
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

async function createOssFileService() {
  const configManager = await loadEnvAndCreateOssFileConfigManager();
  const config = configManager.getConfig();
  validateOssConfig(config.storageProviders[OSS_STORAGE_KEY] as AliyunOSSConfig);

  return createProfilePersistentFileService();
}

export async function uploadDietImageToOss(input: {
  file: File;
  userId: string | number;
}): Promise<{ imageUrl: string; fileId: string }> {
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
    const message = error instanceof Error ? error.message : '未知错误';
    throw new DietUploadError(`饮食截图上传到 OSS 失败：${message}`, 'UPLOAD_FAILED');
  }
}
