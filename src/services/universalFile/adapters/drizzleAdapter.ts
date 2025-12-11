/**
 * Drizzle ORM 适配器
 * 
 * 实现 sa2kit 的 IFileMetadataRepository 接口
 * 连接到现有的数据库 schema 和服务
 */

import type {
  IFileMetadataRepository,
  FileQueryOptions,
  PaginatedResult,
  StorageType,
} from 'sa2kit/universalFile/server';

// 使用本地类型别名避免与 Drizzle schema 冲突
type FileMetadataInput = {
  id: string;
  originalName: string;
  storageName: string;
  size: number;
  mimeType: string;
  extension: string;
  hash?: string;
  uploadTime: Date;
  permission: 'public' | 'private' | 'authenticated' | 'owner-only';
  uploaderId: string;
  moduleId: string;
  businessId?: string;
  storageProvider: StorageType;
  storagePath: string;
  cdnUrl?: string;
  accessCount: number;
  lastAccessTime?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
};

import { db } from '@/db/index';
import { fileMetadata as fileMetadataTable, fileStorageProviders } from '../db/schema';
import { eq, and, like, desc, asc } from 'drizzle-orm';

/**
 * 创建 Drizzle 数据库仓储实例
 */
export function createDrizzleFileRepository(): IFileMetadataRepository {
  return {
    /**
     * 保存文件元数据到数据库
     */
    async save(meta: any): Promise<void> {
      try {
        // 根据metadata中的storageProvider字段获取对应的存储提供者ID
        const [storageProvider] = await db
          .select()
          .from(fileStorageProviders)
          .where(eq(fileStorageProviders.type, meta.storageProvider as string))
          .limit(1);

        let providerId: number;

        if (!storageProvider) {
          console.warn(
            `⚠️ [DrizzleFileRepository] 存储提供者 ${meta.storageProvider} 不存在，尝试使用默认提供者`
          );

          // 回退到默认存储提供者
          const [defaultProvider] = await db
            .select()
            .from(fileStorageProviders)
            .where(eq(fileStorageProviders.isDefault, true))
            .limit(1);

          if (!defaultProvider) {
            throw new Error('未找到可用的存储提供者');
          }

          providerId = defaultProvider.id;
          console.log(
            `✅ [DrizzleFileRepository] 使用默认存储提供者: ${defaultProvider.name} (${defaultProvider.type})`
          );
        } else {
          providerId = storageProvider.id;
          console.log(
            `✅ [DrizzleFileRepository] 使用存储提供者: ${storageProvider.name} (${storageProvider.type})`
          );
        }

        // 保存到数据库
        await db.insert(fileMetadataTable).values({
          id: meta.id,
          originalName: meta.originalName,
          storedName: meta.storageName,
          extension: meta.extension,
          mimeType: meta.mimeType,
          size: meta.size,
          md5Hash: meta.hash?.substring(0, 32) || '',
          sha256Hash: meta.hash || '',
          storageProviderId: providerId,
          storagePath: meta.storagePath,
          cdnUrl: meta.cdnUrl,
          moduleId: meta.moduleId,
          businessId: meta.businessId,
          tags: [],
          metadata: meta.metadata,
          isTemporary: false,
          isDeleted: false,
          accessCount: meta.accessCount || 0,
          downloadCount: 0,
          uploaderId: meta.uploaderId || 'system',
          uploadTime: meta.uploadTime,
          lastAccessTime: meta.lastAccessTime,
          expiresAt: meta.expiresAt,
        });

        console.log('💾 [DrizzleFileRepository] 文件元数据保存成功:', meta.id);
      } catch (error) {
        console.log('❌ [DrizzleFileRepository] 保存文件元数据失败:', error);
        throw new Error(`保存文件元数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },

    /**
     * 从数据库获取文件元数据
     */
    async get(fileId: string): Promise<any | null> {
      try {
        // 查询数据库
        const [record] = await db
          .select()
          .from(fileMetadataTable)
          .where(eq(fileMetadataTable.id, fileId))
          .limit(1);

        if (!record) {
          console.log('🔍 [DrizzleFileRepository] 文件元数据不存在:', fileId);
          return null;
        }

        // 查询存储提供者信息
        const [provider] = await db
          .select()
          .from(fileStorageProviders)
          .where(eq(fileStorageProviders.id, record.storageProviderId))
          .limit(1);

        if (!provider) {
          console.log('🔍 [DrizzleFileRepository] 存储提供者不存在:', record.storageProviderId);
          return null;
        }

        // 转换为FileMetadata格式
        const result: FileMetadataInput = {
          id: record.id,
          originalName: record.originalName,
          storageName: record.storedName,
          size: record.size,
          mimeType: record.mimeType,
          extension: record.extension || '',
          hash: record.md5Hash,
          uploadTime: record.uploadTime,
          permission: 'public' as const, // 默认公开
          uploaderId: record.uploaderId,
          moduleId: record.moduleId || '',
          businessId: record.businessId || undefined,
          storageProvider: provider.type as StorageType, // 使用数据库中的存储提供者类型
          storagePath: record.storagePath,
          cdnUrl: record.cdnUrl || undefined,
          accessCount: record.accessCount,
          lastAccessTime: record.lastAccessTime || undefined,
          expiresAt: record.expiresAt || undefined,
          metadata: record.metadata as Record<string, any> || {},
        };

        console.log('🔍 [DrizzleFileRepository] 文件元数据查询成功:', fileId);
        return result;
      } catch (error) {
        console.error('❌ [DrizzleFileRepository] 查询文件元数据失败:', error);
        return null;
      }
    },

    /**
     * 查询文件列表
     */
    async query(options: FileQueryOptions): Promise<PaginatedResult<any>> {
      try {
        const page = options.page || 1;
        const pageSize = options.pageSize || 20;
        const offset = (page - 1) * pageSize;

        // 构建查询条件
        const conditions: any[] = [];

        if (options.moduleId) {
          conditions.push(eq(fileMetadataTable.moduleId, options.moduleId));
        }

        if (options.businessId) {
          conditions.push(eq(fileMetadataTable.businessId, options.businessId));
        }

        if (options.uploaderId) {
          conditions.push(eq(fileMetadataTable.uploaderId, options.uploaderId));
        }

        if (options.mimeType) {
          conditions.push(like(fileMetadataTable.mimeType, `%${options.mimeType}%`));
        }

        // 查询数据
        const query = db.select().from(fileMetadataTable);

        if (conditions.length > 0) {
          query.where(and(...conditions));
        }

        // 排序
        const sortBy = options.orderBy || 'uploadTime';
        const sortOrder = options.orderDirection || 'desc';
        const orderFn = sortOrder === 'asc' ? asc : desc;
        query.orderBy(orderFn(fileMetadataTable[sortBy as keyof typeof fileMetadataTable] as any));

        // 分页
        query.limit(pageSize).offset(offset);

        const records = await query;

        // 查询总数
        const [countResult] = await db
          .select({ count: fileMetadataTable.id })
          .from(fileMetadataTable)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        const total = typeof countResult?.count === 'number' ? countResult.count : 0;
        const totalPages = Math.ceil(total / pageSize);

        // 转换为 FileMetadata 格式
        const items: FileMetadataInput[] = [];
        for (const record of records) {
          // 查询存储提供者信息
          const [provider] = await db
            .select()
            .from(fileStorageProviders)
            .where(eq(fileStorageProviders.id, record.storageProviderId))
            .limit(1);

          if (provider) {
            items.push({
              id: record.id,
              originalName: record.originalName,
              storageName: record.storedName,
              size: record.size,
              mimeType: record.mimeType,
              extension: record.extension || '',
              hash: record.md5Hash,
              uploadTime: record.uploadTime,
              permission: 'public' as const,
              uploaderId: record.uploaderId,
              moduleId: record.moduleId || '',
              businessId: record.businessId || undefined,
              storageProvider: provider.type as StorageType,
              storagePath: record.storagePath,
              cdnUrl: record.cdnUrl || undefined,
              accessCount: record.accessCount,
              lastAccessTime: record.lastAccessTime || undefined,
              expiresAt: record.expiresAt || undefined,
              metadata: record.metadata as Record<string, any> || {},
            });
          }
        }

        return {
          items,
          total,
          page,
          pageSize,
          totalPages,
        };
      } catch (error) {
        console.error('❌ [DrizzleFileRepository] 查询文件列表失败:', error);
        throw error;
      }
    },

    /**
     * 从数据库删除文件元数据 (软删除)
     */
    async delete(fileId: string): Promise<void> {
      try {
        // 软删除：标记为已删除
        await db
          .update(fileMetadataTable)
          .set({
            isDeleted: true,
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(fileMetadataTable.id, fileId));

        console.log('🗑️ [DrizzleFileRepository] 文件元数据删除成功:', fileId);
      } catch (error) {
        console.error('❌ [DrizzleFileRepository] 删除文件元数据失败:', error);
        throw new Error(`删除文件元数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },

    /**
     * 批量删除文件元数据
     */
    async batchDelete(fileIds: string[]): Promise<void> {
      try {
        // 批量软删除
        for (const fileId of fileIds) {
          await this.delete(fileId);
        }
        console.log('🗑️ [DrizzleFileRepository] 批量删除元数据成功:', fileIds.length);
      } catch (error) {
        console.error('❌ [DrizzleFileRepository] 批量删除失败:', error);
        throw error;
      }
    },
  };
}
