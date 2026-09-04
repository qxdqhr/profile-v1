import { createOssFileConfigManager } from 'sa2kit/common/ossFile/server';
import {
  createOssFileBootstrap,
  fileMetadata,
  fileStorageProviders,
} from 'sa2kit/common/file/server';
import { db } from '@profile/db';

export { formatTeachHubStorageError } from 'sa2kit/business/teachHub/server';

let localFallbackBootstrap: ReturnType<typeof createOssFileBootstrap> | null = null;

export function getTeachHubLocalFileService() {
  localFallbackBootstrap ??= createOssFileBootstrap({
    loadConfigManager: async () =>
      createOssFileConfigManager({ ossConfig: null, fallbackToLocal: true }),
    persistence: { db, fileMetadata, fileStorageProviders },
  });
  return localFallbackBootstrap.createPersistentFileService();
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
