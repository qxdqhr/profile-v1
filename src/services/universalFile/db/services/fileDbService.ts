/**
 * 通用文件服务数据库操作类
 * 提供基础的文件数据库CRUD操作
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, desc, sql, isNull, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { cacheManager } from '../../cache/CacheManager';
import { queryOptimizer } from '../middleware/queryOptimizer';
import {
  fileStorageProviders,
  fileFolders,
  fileMetadata,
  fileVersions,
  fileProcessingRecords,
  fileShares,
  fileAccessLogs,
  fileThumbnails,
  type FileStorageProvider,
  type FileFolder,
  type FileMetadata,
  type NewFileStorageProvider,
  type NewFileFolder,
  type NewFileMetadata,
  type NewFileVersion,
  type NewFileProcessingRecord,
  type NewFileShare,
  type NewFileAccessLog,
  type NewFileThumbnail
} from '../schema';

/**
 * 文件查询过滤选项
 */
interface FileQueryOptions {
  /** 模块ID */
  moduleId?: string;
  /** 业务ID */
  businessId?: string;
  /** 文件夹ID */
  folderId?: string;
  /** 分页偏移量 */
  offset?: number;
  /** 分页大小 */
  limit?: number;
  /** 是否已删除 */
  isDeleted?: boolean;
  /** 上传者ID */
  uploaderId?: string;
}

/**
 * 通用文件数据库服务类
 */
export class FileDbService {
  constructor(private db: ReturnType<typeof drizzle>) {}

  // ========== 存储提供者管理 ==========

  /**
   * 获取默认存储提供者
   */
  async getDefaultStorageProvider(): Promise<FileStorageProvider | null> {
    const result = await this.db
      .select()
      .from(fileStorageProviders)
      .where(and(
        eq(fileStorageProviders.isDefault, true),
        eq(fileStorageProviders.isActive, true)
      ))
      .limit(1);

    return result[0] || null;
  }

  /**
   * 创建存储提供者
   */
  async createStorageProvider(provider: NewFileStorageProvider): Promise<FileStorageProvider> {
    const result = await this.db
      .insert(fileStorageProviders)
      .values(provider)
      .returning();

    return result[0];
  }

  // ========== 文件夹管理 ==========

  /**
   * 根据路径获取文件夹
   */
  async getFolderByPath(path: string, moduleId?: string): Promise<FileFolder | null> {
    const conditions = [eq(fileFolders.path, path)];
    
    if (moduleId) {
      conditions.push(eq(fileFolders.moduleId, moduleId));
    }

    const result = await this.db
      .select()
      .from(fileFolders)
      .where(and(...conditions))
      .limit(1);
      
    return result[0] || null;
  }

  /**
   * 创建文件夹
   */
  async createFolder(folder: NewFileFolder): Promise<FileFolder> {
    const id = folder.id || uuidv4();
    
    const result = await this.db
      .insert(fileFolders)
      .values({ ...folder, id })
      .returning();

    return result[0];
  }

  // ========== 文件元数据管理 ==========

  /**
   * 获取文件列表
   */
  async getFiles(options: FileQueryOptions = {}): Promise<{ files: FileMetadata[]; total: number }> {
    // 构建基础查询
    let whereConditions: any[] = [];

    if (options.moduleId) {
      whereConditions.push(eq(fileMetadata.moduleId, options.moduleId));
    }

    if (options.businessId) {
      whereConditions.push(eq(fileMetadata.businessId, options.businessId));
    }

    if (options.folderId) {
      whereConditions.push(eq(fileMetadata.folderId, options.folderId));
    }

    if (options.isDeleted !== undefined) {
      whereConditions.push(eq(fileMetadata.isDeleted, options.isDeleted));
    } else {
      // 默认不显示已删除的文件
      whereConditions.push(eq(fileMetadata.isDeleted, false));
    }

    if (options.uploaderId) {
      whereConditions.push(eq(fileMetadata.uploaderId, options.uploaderId));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // 获取总数
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(fileMetadata)
      .where(whereClause);

    const total = countResult[0].count;

    // 获取数据
    let query = this.db
      .select()
      .from(fileMetadata)
      .where(whereClause)
      .orderBy(desc(fileMetadata.uploadTime));

    if (options.limit) {
      query = query.limit(options.limit) as any;
    }

    if (options.offset) {
      query = query.offset(options.offset) as any;
    }

    const files = await query;

    return { files, total };
  }

  /**
   * 根据ID获取文件（带缓存）
   */
  async getFileById(id: string): Promise<FileMetadata | null> {
    const cacheKey = `file:${id}`;
    
    // 尝试从缓存获取
    const cached = await cacheManager.get<FileMetadata>(cacheKey);
    if (cached) {
      return cached;
    }

    // 缓存未命中，查询数据库
    const result = await queryOptimizer.monitorQuery(
      async () => {
        return await this.db
          .select()
          .from(fileMetadata)
          .where(eq(fileMetadata.id, id))
          .limit(1);
      },
      `SELECT * FROM file_metadata WHERE id = $1 LIMIT 1`,
      [id]
    );

    const file = result[0] || null;
    
    // 如果找到文件，缓存结果（5分钟）
    if (file) {
      await cacheManager.set(cacheKey, file, 300);
    }

    return file;
  }

  /**
   * 根据MD5哈希获取文件
   */
  async getFileByMd5Hash(md5Hash: string): Promise<FileMetadata | null> {
    const result = await this.db
      .select()
      .from(fileMetadata)
      .where(eq(fileMetadata.md5Hash, md5Hash))
      .limit(1);

    return result[0] || null;
  }

  /**
   * 创建文件记录
   */
  async createFile(file: NewFileMetadata): Promise<FileMetadata> {
    const id = file.id || uuidv4();
    
    const result = await queryOptimizer.monitorQuery(
      async () => {
        return await this.db
          .insert(fileMetadata)
          .values({ ...file, id })
          .returning();
      },
      `INSERT INTO file_metadata VALUES (...) RETURNING *`,
      [file]
    );

    const createdFile = result[0];

    // 缓存新创建的文件
    const cacheKey = `file:${createdFile.id}`;
    await cacheManager.set(cacheKey, createdFile, 300);

    // 清除相关的列表缓存
    if (file.moduleId) {
      await cacheManager.deletePattern(`files:${file.moduleId}:*`);
    }
    if (file.folderId) {
      await cacheManager.deletePattern(`folder:${file.folderId}:*`);
    }

    return createdFile;
  }

  /**
   * 更新文件记录
   */
  async updateFile(id: string, updates: Partial<NewFileMetadata>): Promise<FileMetadata | null> {
    const result = await this.db
      .update(fileMetadata)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fileMetadata.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * 软删除文件
   */
  async softDeleteFile(id: string): Promise<boolean> {
    const result = await this.db
      .update(fileMetadata)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(fileMetadata.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * 更新文件访问统计
   */
  async updateFileAccessStats(id: string, accessType: 'view' | 'download'): Promise<void> {
    if (accessType === 'view') {
      await this.db
        .update(fileMetadata)
        .set({
          accessCount: sql`${fileMetadata.accessCount} + 1`,
          lastAccessTime: new Date(),
          updatedAt: new Date()
        })
        .where(eq(fileMetadata.id, id));
    } else if (accessType === 'download') {
      await this.db
        .update(fileMetadata)
        .set({
          downloadCount: sql`${fileMetadata.downloadCount} + 1`,
          lastAccessTime: new Date(),
          updatedAt: new Date()
        })
        .where(eq(fileMetadata.id, id));
    }
  }

  // ========== 文件版本管理 ==========

  /**
   * 创建新版本
   */
  async createFileVersion(version: NewFileVersion): Promise<FileMetadata> {
    const id = uuidv4();
    const result = await this.db
      .insert(fileVersions)
      .values({ ...version, id })
      .returning();

    return result[0] as any;
  }

  // ========== 文件处理记录管理 ==========

  /**
   * 创建处理记录
   */
  async createProcessingRecord(record: NewFileProcessingRecord): Promise<any> {
    const id = uuidv4();
    const result = await this.db
      .insert(fileProcessingRecords)
      .values({ ...record, id })
      .returning();

    return result[0];
  }

  /**
   * 更新处理记录
   */
  async updateProcessingRecord(id: string, updates: Partial<NewFileProcessingRecord>): Promise<any> {
    const result = await this.db
      .update(fileProcessingRecords)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fileProcessingRecords.id, id))
      .returning();

    return result[0] || null;
  }

  // ========== 文件分享管理 ==========

  /**
   * 根据分享代码获取分享信息
   */
  async getShareByCode(shareCode: string): Promise<any> {
    const result = await this.db
      .select()
      .from(fileShares)
      .where(and(
        eq(fileShares.shareCode, shareCode),
        eq(fileShares.isActive, true)
      ))
      .limit(1);

    return result[0] || null;
  }

  /**
   * 创建文件分享
   */
  async createFileShare(share: NewFileShare): Promise<any> {
    const id = uuidv4();
    const result = await this.db
      .insert(fileShares)
      .values({ ...share, id })
      .returning();

    return result[0];
  }

  // ========== 文件访问日志 ==========

  /**
   * 记录文件访问日志
   */
  async logFileAccess(log: NewFileAccessLog): Promise<any> {
    const id = uuidv4();
    const result = await this.db
      .insert(fileAccessLogs)
      .values({ ...log, id })
      .returning();

    return result[0];
  }

  // ========== 文件缩略图管理 ==========

  /**
   * 创建缩略图记录
   */
  async createThumbnail(thumbnail: NewFileThumbnail): Promise<any> {
    const id = uuidv4();
    const result = await this.db
      .insert(fileThumbnails)
      .values({ ...thumbnail, id })
      .returning();

    return result[0];
  }

  // ========== 统计查询 ==========

  /**
   * 获取文件统计信息
   */
  async getFileStats(moduleId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
  }> {
    let whereConditions: any[] = [eq(fileMetadata.isDeleted, false)];

    if (moduleId) {
      whereConditions.push(eq(fileMetadata.moduleId, moduleId));
    }

    const whereClause = and(...whereConditions);

    // 总文件数和总大小
    const totalStats = await this.db
      .select({
        count: sql<number>`count(*)`,
        totalSize: sql<number>`sum(${fileMetadata.size})`
      })
      .from(fileMetadata)
      .where(whereClause);

    return {
      totalFiles: totalStats[0].count || 0,
      totalSize: totalStats[0].totalSize || 0,
    };
  }

  // ========== 扩展的文件夹管理方法 ==========

  /**
   * 获取文件夹列表
   */
  async getFolders(params: {
    parentId?: string;
    moduleId?: string;
    businessId?: string;
  }) {
    const conditions = [];

    if (params.parentId !== undefined) {
      if (params.parentId === null) {
        conditions.push(isNull(fileFolders.parentId));
      } else {
        conditions.push(eq(fileFolders.parentId, params.parentId));
      }
    }

    if (params.moduleId) {
      conditions.push(eq(fileFolders.moduleId, params.moduleId));
    }

    if (params.businessId) {
      conditions.push(eq(fileFolders.businessId, params.businessId));
    }

    const folders = await this.db
      .select()
      .from(fileFolders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(fileFolders.sortOrder), asc(fileFolders.name));

    return folders;
  }

  /**
   * 根据ID获取文件夹
   */
  async getFolderById(folderId: string) {
    const [folder] = await this.db
      .select()
      .from(fileFolders)
      .where(eq(fileFolders.id, folderId))
      .limit(1);

    return folder || null;
  }

  /**
   * 更新文件夹
   */
  async updateFolder(folderId: string, data: Partial<{
    name: string;
    parentId: string;
    description: string;
    sortOrder: number;
  }>) {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId || null;
    }

    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }

    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder;
    }

    // 如果更新了名称或父文件夹，需要重新计算路径
    if (data.name !== undefined || data.parentId !== undefined) {
      const folder = await this.getFolderById(folderId);
      if (folder) {
        const newName = data.name || folder.name;
        let newPath = newName;
        let newDepth = 0;

        const newParentId = data.parentId !== undefined ? data.parentId : folder.parentId;
        if (newParentId) {
          const parentFolder = await this.getFolderById(newParentId);
          if (parentFolder) {
            newPath = `${parentFolder.path}/${newName}`;
            newDepth = parentFolder.depth + 1;
          }
        }

        updateData.path = newPath;
        updateData.depth = newDepth;
      }
    }

    const [updatedFolder] = await this.db
      .update(fileFolders)
      .set(updateData)
      .where(eq(fileFolders.id, folderId))
      .returning();

    return updatedFolder;
  }

  /**
   * 删除文件夹
   */
  async deleteFolder(folderId: string, recursive: boolean = false) {
    if (recursive) {
      // 递归删除子文件夹
      const subFolders = await this.getFolders({ parentId: folderId });
      for (const subFolder of subFolders) {
        await this.deleteFolder(subFolder.id, true);
      }

      // 删除文件夹内的文件（逻辑删除）
      await this.db
        .update(fileMetadata)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
        })
        .where(eq(fileMetadata.folderId, folderId));
    }

    // 删除文件夹
    await this.db
      .delete(fileFolders)
      .where(eq(fileFolders.id, folderId));
  }
} 