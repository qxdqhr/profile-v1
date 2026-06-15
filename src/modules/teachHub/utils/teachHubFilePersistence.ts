import { eq } from 'drizzle-orm';
import { fileMetadata, fileStorageProviders } from 'sa2kit/common/file/server';
import { db } from '@/db';

type UploadedFileMeta = {
  id: string;
  originalName: string;
  storageName: string;
  extension?: string;
  mimeType: string;
  size: number;
  hash?: string;
  storagePath: string;
  cdnUrl?: string | null;
  moduleId?: string;
  businessId?: string;
  metadata?: Record<string, unknown> | null;
  storageProvider?: string;
  uploadTime?: Date | string;
};

const providerIdCache = new Map<string, number>();

/** sa2kit 自动持久化依赖 file_storage_providers，本地库可能为空，需先确保存在 */
export async function ensureTeachHubStorageProviderId(type: string): Promise<number> {
  const cached = providerIdCache.get(type);
  if (cached != null) return cached;

  const [existing] = await db
    .select()
    .from(fileStorageProviders)
    .where(eq(fileStorageProviders.type, type))
    .limit(1);

  if (existing) {
    providerIdCache.set(type, existing.id);
    return existing.id;
  }

  const isOss = type === 'aliyun-oss';
  const [created] = await db
    .insert(fileStorageProviders)
    .values({
      name: isOss ? 'aliyun-oss-default' : 'local-default',
      type,
      config: isOss ? { enabled: true } : { basePath: 'uploads' },
      isActive: true,
      isDefault: !isOss,
      priority: isOss ? 10 : 100,
    })
    .returning();

  if (!created) {
    throw new Error(`创建存储提供者失败: ${type}`);
  }

  providerIdCache.set(type, created.id);
  return created.id;
}

/** 上传成功后写入 file_metadata（覆盖同 id 记录，支持 Mission 保存） */
export async function persistTeachHubUploadMetadata(
  meta: UploadedFileMeta,
  uploaderId: string,
): Promise<void> {
  const storageType = meta.storageProvider || 'aliyun-oss';
  const providerId = await ensureTeachHubStorageProviderId(storageType);
  const now = new Date();
  const uploadTime =
    meta.uploadTime instanceof Date
      ? meta.uploadTime
      : meta.uploadTime
        ? new Date(meta.uploadTime)
        : now;

  const row = {
    id: meta.id,
    originalName: meta.originalName,
    storedName: meta.storageName,
    extension: meta.extension || null,
    mimeType: meta.mimeType,
    size: meta.size,
    md5Hash: (meta.hash || '').substring(0, 32) || 'unknown',
    sha256Hash: meta.hash || null,
    storageProviderId: providerId,
    storagePath: meta.storagePath,
    cdnUrl: meta.cdnUrl || null,
    moduleId: meta.moduleId || null,
    businessId: meta.businessId || null,
    tags: [],
    metadata: meta.metadata || {},
    isTemporary: false,
    isDeleted: false,
    accessCount: 0,
    downloadCount: 0,
    uploaderId,
    uploadTime,
    updatedAt: now,
  };

  const [existing] = await db
    .select({ id: fileMetadata.id })
    .from(fileMetadata)
    .where(eq(fileMetadata.id, meta.id))
    .limit(1);

  if (existing) {
    await db.update(fileMetadata).set(row).where(eq(fileMetadata.id, meta.id));
    return;
  }

  await db.insert(fileMetadata).values({
    ...row,
    createdAt: now,
  });
}
