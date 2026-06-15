import { createOssFileConfigManager } from 'sa2kit/common/ossFile/server';
import {
  createOssFileBootstrap,
  fileMetadata,
  fileStorageProviders,
} from 'sa2kit/common/file/server';
import { db } from '@/db';

let localFallbackBootstrap: ReturnType<typeof createOssFileBootstrap> | null = null;

export function getTeachHubLocalFileService() {
  localFallbackBootstrap ??= createOssFileBootstrap({
    loadConfigManager: async () =>
      createOssFileConfigManager({ ossConfig: null, fallbackToLocal: true }),
    persistence: { db, fileMetadata, fileStorageProviders },
  });
  return localFallbackBootstrap.createFileService();
}

export function formatTeachHubStorageError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('InvalidAccessKeyId') || message.includes('Access Key Id')) {
    return '文件存储 OSS 密钥无效或已禁用，已尝试本地存储；若仍失败请联系管理员更新 storage.aliyunOss 配置';
  }
  if (message.includes('OSS') || message.includes('上传失败')) {
    return `文件存储失败：${message}`;
  }
  return message || '文件存储失败';
}

export function isOssUploadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('OSS') ||
    message.includes('InvalidAccessKeyId') ||
    message.includes('Access Key Id') ||
    message.includes('FILE_UPLOAD_ERROR') ||
    message.includes('上传失败')
  );
}
