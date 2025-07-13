/**
 * 数据迁移脚本
 * 将现有的文件传输数据迁移到新的通用文件服务表结构
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// 导入新的表结构
import {
  fileStorageProviders,
  fileFolders,
  fileMetadata,
  type NewFileStorageProvider,
  type NewFileFolder,
  type NewFileMetadata
} from '../schema';

// 导入旧的表结构
import { fileTransfers } from '@/modules/filetransfer/db/schema';

interface MigrationOptions {
  /** 数据库连接字符串 */
  databaseUrl: string;
  /** 是否为试运行（不实际写入数据） */
  dryRun?: boolean;
  /** 迁移批次大小 */
  batchSize?: number;
  /** 日志级别 */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

interface MigrationResult {
  /** 迁移的文件数量 */
  migratedFiles: number;
  /** 创建的文件夹数量 */
  createdFolders: number;
  /** 错误列表 */
  errors: Array<{ id: string; error: string }>;
  /** 迁移耗时（毫秒） */
  duration: number;
}

/**
 * 数据迁移主类
 */
export class UniversalFileDataMigration {
  private db: ReturnType<typeof drizzle>;
  private options: Required<MigrationOptions>;
  private logger: (level: string, message: string, data?: any) => void;

  constructor(options: MigrationOptions) {
    this.options = {
      dryRun: false,
      batchSize: 100,
      logLevel: 'info',
      ...options
    };

    // 初始化数据库连接
    const client = postgres(this.options.databaseUrl);
    this.db = drizzle(client);

    // 初始化日志器
    this.logger = (level, message, data) => {
      const levels = ['debug', 'info', 'warn', 'error'];
      const currentLevelIndex = levels.indexOf(this.options.logLevel);
      const messageLevelIndex = levels.indexOf(level);

      if (messageLevelIndex >= currentLevelIndex) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data || '');
      }
    };
  }

  /**
   * 执行完整的数据迁移
   */
  async migrate(): Promise<MigrationResult> {
    const startTime = Date.now();
    this.logger('info', '开始执行数据迁移...');

    const result: MigrationResult = {
      migratedFiles: 0,
      createdFolders: 0,
      errors: [],
      duration: 0
    };

    try {
      // 1. 确保存储提供者存在
      await this.ensureStorageProviders();

      // 2. 创建模块文件夹结构
      result.createdFolders = await this.createModuleFolders();

      // 3. 迁移文件传输数据
      result.migratedFiles = await this.migrateFileTransfers();

      // 4. 验证迁移结果
      await this.validateMigration();

      this.logger('info', '数据迁移完成', {
        migratedFiles: result.migratedFiles,
        createdFolders: result.createdFolders,
        errors: result.errors.length
      });

    } catch (error) {
      this.logger('error', '数据迁移失败', error);
      throw error;
    } finally {
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * 确保存储提供者存在
   */
  private async ensureStorageProviders(): Promise<void> {
    this.logger('info', '检查存储提供者配置...');

    // 检查是否已存在默认存储提供者
    const existingProviders = await this.db
      .select()
      .from(fileStorageProviders)
      .where(eq(fileStorageProviders.isDefault, true));

    if (existingProviders.length === 0) {
      // 创建默认本地存储提供者
      const defaultProvider: NewFileStorageProvider = {
        name: 'local_storage',
        type: 'local',
        config: {
          uploadPath: './uploads',
          publicPath: '/uploads',
          allowedMimeTypes: ['*/*'],
          maxFileSize: 100 * 1024 * 1024 // 100MB
        },
        isActive: true,
        isDefault: true,
        priority: 1,
        supportedMimeTypes: ['*/*']
      };

      if (!this.options.dryRun) {
        await this.db.insert(fileStorageProviders).values(defaultProvider);
      }
      
      this.logger('info', '创建默认存储提供者', defaultProvider);
    }
  }

  /**
   * 创建模块文件夹结构
   */
  private async createModuleFolders(): Promise<number> {
    this.logger('info', '创建模块文件夹结构...');

    // 定义需要创建的模块文件夹
    const moduleFolders = [
      { moduleId: 'filetransfer', name: '文件传输' },
      { moduleId: 'showmasterpiece', name: '画集展示' },
      { moduleId: 'mikutap', name: 'Mikutap音乐' },
      { moduleId: 'mmd', name: 'MMD模型' },
      { moduleId: 'cardmaker', name: '名片制作' },
      { moduleId: 'calendar', name: '日历事件' },
      { moduleId: 'idealist', name: '想法清单' }
    ];

    let createdCount = 0;

    for (const moduleFolder of moduleFolders) {
      // 检查文件夹是否已存在
      const existing = await this.db
        .select()
        .from(fileFolders)
        .where(eq(fileFolders.moduleId, moduleFolder.moduleId))
        .limit(1);

      if (existing.length === 0) {
        const folder: NewFileFolder = {
          id: uuidv4(),
          name: moduleFolder.name,
          moduleId: moduleFolder.moduleId,
          path: `/${moduleFolder.moduleId}`,
          depth: 1,
          sortOrder: createdCount,
          isSystem: true,
          createdBy: 'migration'
        };

        if (!this.options.dryRun) {
          await this.db.insert(fileFolders).values(folder);
        }

        createdCount++;
        this.logger('debug', `创建模块文件夹: ${moduleFolder.name}`);
      }
    }

    this.logger('info', `创建了 ${createdCount} 个模块文件夹`);
    return createdCount;
  }

  /**
   * 迁移文件传输数据
   */
  private async migrateFileTransfers(): Promise<number> {
    this.logger('info', '开始迁移文件传输数据...');

    // 获取所有文件传输记录
    const transfers = await this.db.select().from(fileTransfers);
    this.logger('info', `找到 ${transfers.length} 条文件传输记录`);

    // 获取默认存储提供者
    const defaultProvider = await this.db
      .select()
      .from(fileStorageProviders)
      .where(eq(fileStorageProviders.isDefault, true))
      .limit(1);

    if (defaultProvider.length === 0) {
      throw new Error('未找到默认存储提供者');
    }

    // 获取文件传输模块文件夹
    const transferFolder = await this.db
      .select()
      .from(fileFolders)
      .where(eq(fileFolders.moduleId, 'filetransfer'))
      .limit(1);

    const folderId = transferFolder.length > 0 ? transferFolder[0].id : undefined;

    let migratedCount = 0;
    const errors: Array<{ id: string; error: string }> = [];

    // 分批处理
    for (let i = 0; i < transfers.length; i += this.options.batchSize) {
      const batch = transfers.slice(i, i + this.options.batchSize);
      
      for (const transfer of batch) {
        try {
          // 生成文件哈希（如果文件存在）
          const filePath = transfer.filePath;
          let md5Hash = '';
          let sha256Hash = '';
          let actualSize = transfer.fileSize;

          try {
            const stats = await fs.stat(filePath);
            actualSize = stats.size;

            // 计算文件哈希
            const fileBuffer = await fs.readFile(filePath);
            md5Hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
            sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
          } catch (fileError) {
            this.logger('warn', `无法读取文件: ${filePath}`, fileError);
            // 使用文件路径和时间戳生成模拟哈希
            md5Hash = crypto.createHash('md5').update(`${filePath}-${transfer.createdAt}`).digest('hex');
          }

          // 解析文件扩展名
          const extension = path.extname(transfer.fileName).toLowerCase().substring(1);

          // 创建文件元数据记录
          const fileRecord: NewFileMetadata = {
            id: uuidv4(),
            originalName: transfer.fileName,
            storedName: path.basename(transfer.filePath),
            extension: extension || undefined,
            mimeType: transfer.fileType,
            size: actualSize,
            md5Hash,
            sha256Hash,
            storageProviderId: defaultProvider[0].id,
            storagePath: transfer.filePath,
            folderId,
            moduleId: 'filetransfer',
            businessId: transfer.id, // 使用原始transfer ID作为业务ID
            tags: [],
            metadata: {
              originalTransferId: transfer.id,
              transferStatus: transfer.status,
              progress: transfer.progress,
              migratedAt: new Date().toISOString()
            },
            isTemporary: transfer.status !== 'completed',
            isDeleted: false,
            accessCount: 0,
            downloadCount: transfer.downloadCount,
            uploaderId: transfer.uploaderId,
            uploadTime: transfer.createdAt,
            lastAccessTime: transfer.updatedAt,
            expiresAt: transfer.expiresAt,
            createdAt: transfer.createdAt,
            updatedAt: transfer.updatedAt
          };

          if (!this.options.dryRun) {
            await this.db.insert(fileMetadata).values(fileRecord);
          }

          migratedCount++;
          this.logger('debug', `迁移文件: ${transfer.fileName}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push({ id: transfer.id, error: errorMessage });
          this.logger('error', `迁移文件失败: ${transfer.fileName}`, error);
        }
      }

      // 显示进度
      this.logger('info', `已迁移 ${Math.min(i + this.options.batchSize, transfers.length)}/${transfers.length} 条记录`);
    }

    if (errors.length > 0) {
      this.logger('warn', `迁移过程中发生 ${errors.length} 个错误`);
    }

    this.logger('info', `成功迁移 ${migratedCount} 个文件`);
    return migratedCount;
  }

  /**
   * 验证迁移结果
   */
  private async validateMigration(): Promise<void> {
    this.logger('info', '验证迁移结果...');

    // 统计新表中的记录数
    const fileCount = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(fileMetadata);

    const folderCount = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(fileFolders);

    const providerCount = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(fileStorageProviders);

    this.logger('info', '迁移结果统计', {
      files: fileCount[0].count,
      folders: folderCount[0].count,
      providers: providerCount[0].count
    });

    // 检查数据完整性
    const duplicateHashes = await this.db
      .select({ 
        md5Hash: fileMetadata.md5Hash, 
        count: sql<number>`count(*)` 
      })
      .from(fileMetadata)
      .groupBy(fileMetadata.md5Hash)
      .having(sql`count(*) > 1`);

    if (duplicateHashes.length > 0) {
      this.logger('warn', `发现 ${duplicateHashes.length} 组重复文件（相同MD5）`);
    }
  }

  /**
   * 回滚迁移（删除新创建的数据）
   */
  async rollback(): Promise<void> {
    this.logger('info', '开始回滚迁移...');

    if (this.options.dryRun) {
      this.logger('info', '试运行模式，无需回滚');
      return;
    }

    try {
      // 删除迁移创建的文件记录
      await this.db
        .delete(fileMetadata)
        .where(sql`metadata->>'migratedAt' IS NOT NULL`);

      // 删除系统创建的文件夹
      await this.db
        .delete(fileFolders)
        .where(eq(fileFolders.createdBy, 'migration'));

      this.logger('info', '迁移回滚完成');

    } catch (error) {
      this.logger('error', '回滚失败', error);
      throw error;
    }
  }
}

/**
 * 迁移入口函数
 */
export async function migrateFileData(options: MigrationOptions): Promise<MigrationResult> {
  const migration = new UniversalFileDataMigration(options);
  return migration.migrate();
}

/**
 * 回滚入口函数
 */
export async function rollbackMigration(options: MigrationOptions): Promise<void> {
  const migration = new UniversalFileDataMigration(options);
  await migration.rollback();
} 