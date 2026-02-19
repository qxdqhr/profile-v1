/**
 * FileTransfer模块数据迁移工具
 * 将现有file_transfers表的数据迁移到通用文件服务
 */

import { db } from '@/db';
import { fileTransfers } from '../db/schema';
import { fileMetadata, fileFolders, fileStorageProviders } from 'sa2kit/universalFile/server';
import { eq, and } from 'drizzle-orm';
import { readFile, copyFile, stat } from 'fs/promises';
import { join, basename, extname } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

/**
 * 迁移配置
 */
interface MigrationConfig {
  /** 批处理大小 */
  batchSize: number;
  /** 是否上传到OSS */
  enableOSSUpload: boolean;
  /** 是否验证文件完整性 */
  validateFiles: boolean;
  /** 是否备份原数据 */
  backupOldData: boolean;
  /** 是否试运行（不实际执行） */
  dryRun: boolean;
  /** 是否强制覆盖已存在的记录 */
  forceOverwrite: boolean;
}

/**
 * 迁移结果统计
 */
interface MigrationResult {
  /** 总记录数 */
  totalRecords: number;
  /** 成功迁移数 */
  successCount: number;
  /** 失败记录数 */
  failureCount: number;
  /** 跳过记录数 */
  skippedCount: number;
  /** 文件大小总计（字节） */
  totalFileSize: number;
  /** 迁移失败的记录 */
  failures: Array<{
    id: string;
    fileName: string;
    error: string;
  }>;
  /** 执行时间（毫秒） */
  executionTime: number;
}

/**
 * 迁移进度回调
 */
type ProgressCallback = (progress: {
  current: number;
  total: number;
  percentage: number;
  currentItem: string;
}) => void;

/**
 * FileTransfer数据迁移器
 */
export class FileTransferMigrator {
  private config: MigrationConfig;
  private storageProviderCache: Map<string, any> = new Map();
  private folderCache: Map<string, any> = new Map();

  constructor(config: Partial<MigrationConfig> = {}) {
    this.config = {
      batchSize: config.batchSize || 50,
      enableOSSUpload: config.enableOSSUpload || false,
      validateFiles: config.validateFiles || true,
      backupOldData: config.backupOldData || true,
      dryRun: config.dryRun || false,
      forceOverwrite: config.forceOverwrite || false
    };
  }

  /**
   * 执行数据迁移
   */
  async migrate(progressCallback?: ProgressCallback): Promise<MigrationResult> {
    const startTime = Date.now();
    console.log('🚀 [FileTransferMigrator] 开始数据迁移...');
    console.log('📋 [FileTransferMigrator] 配置:', this.config);

    const result: MigrationResult = {
      totalRecords: 0,
      successCount: 0,
      failureCount: 0,
      skippedCount: 0,
      totalFileSize: 0,
      failures: [],
      executionTime: 0
    };

    try {
      // 1. 分析现有数据
      const analysisResult = await this.analyzeExistingData();
      result.totalRecords = analysisResult.totalRecords;
      result.totalFileSize = analysisResult.totalFileSize;

      console.log('📊 [FileTransferMigrator] 数据分析结果:', analysisResult);

      // 2. 准备迁移环境
      await this.prepareMigrationEnvironment();

      // 3. 分批迁移数据
      const totalBatches = Math.ceil(result.totalRecords / this.config.batchSize);
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const offset = batchIndex * this.config.batchSize;
        
        console.log(`📦 [FileTransferMigrator] 处理批次 ${batchIndex + 1}/${totalBatches}`);
        
        const batchResult = await this.migrateBatch(offset, this.config.batchSize);
        
        result.successCount += batchResult.successCount;
        result.failureCount += batchResult.failureCount;
        result.skippedCount += batchResult.skippedCount;
        result.failures.push(...batchResult.failures);

        // 更新进度
        if (progressCallback) {
          const processed = offset + this.config.batchSize;
          progressCallback({
            current: Math.min(processed, result.totalRecords),
            total: result.totalRecords,
            percentage: Math.min(processed / result.totalRecords * 100, 100),
            currentItem: `批次 ${batchIndex + 1}/${totalBatches}`
          });
        }
      }

      result.executionTime = Date.now() - startTime;

      console.log('✅ [FileTransferMigrator] 数据迁移完成');
      console.log('📈 [FileTransferMigrator] 迁移结果:', {
        总记录数: result.totalRecords,
        成功: result.successCount,
        失败: result.failureCount,
        跳过: result.skippedCount,
        执行时间: `${result.executionTime}ms`
      });

      return result;

    } catch (error) {
      console.error('💥 [FileTransferMigrator] 迁移失败:', error);
      result.executionTime = Date.now() - startTime;
      throw error;
    }
  }

  /**
   * 分析现有数据
   */
  private async analyzeExistingData(): Promise<{
    totalRecords: number;
    totalFileSize: number;
    statusDistribution: Record<string, number>;
    typeDistribution: Record<string, number>;
  }> {
    console.log('🔍 [FileTransferMigrator] 分析现有数据...');

    // 统计总记录数
    const [countResult] = await db
      .select({ count: db.$count(fileTransfers) })
      .from(fileTransfers);

    const totalRecords = countResult.count;

    // 获取所有记录进行分析
    const allRecords = await db.select().from(fileTransfers);

    let totalFileSize = 0;
    const statusDistribution: Record<string, number> = {};
    const typeDistribution: Record<string, number> = {};

    for (const record of allRecords) {
      totalFileSize += record.fileSize;
      
      statusDistribution[record.status] = (statusDistribution[record.status] || 0) + 1;
      typeDistribution[record.fileType] = (typeDistribution[record.fileType] || 0) + 1;
    }

    return {
      totalRecords,
      totalFileSize,
      statusDistribution,
      typeDistribution
    };
  }

  /**
   * 准备迁移环境
   */
  private async prepareMigrationEnvironment(): Promise<void> {
    console.log('🛠️ [FileTransferMigrator] 准备迁移环境...');

    // 1. 确保存储提供者存在
    await this.ensureStorageProvider();

    // 2. 创建fileTransfer模块的根文件夹
    await this.ensureModuleFolder();

    // 3. 如果需要备份，创建备份
    if (this.config.backupOldData && !this.config.dryRun) {
      await this.backupOldData();
    }
  }

  /**
   * 确保存储提供者存在
   */
  private async ensureStorageProvider(): Promise<void> {
    const providerName = 'local-default';
    
    let provider = this.storageProviderCache.get(providerName);
    if (!provider) {
      const [existingProvider] = await db
        .select()
        .from(fileStorageProviders)
        .where(eq(fileStorageProviders.name, providerName))
        .limit(1);

      if (existingProvider) {
        provider = existingProvider;
      } else {
        // 创建默认本地存储提供者
        [provider] = await db
          .insert(fileStorageProviders)
          .values({
            name: providerName,
            type: 'local',
            config: {
              basePath: process.env.FILE_STORAGE_PATH || 'uploads'
            },
            isActive: true,
            isDefault: true
          })
          .returning();
      }

      this.storageProviderCache.set(providerName, provider);
    }
  }

  /**
   * 确保模块文件夹存在
   */
  private async ensureModuleFolder(): Promise<void> {
    const folderId = uuidv4(); // 生成真正的UUID
    const folderName = 'FileTransfer';
    
    let folder = this.folderCache.get(folderName);
    if (!folder) {
      // 先检查是否已存在FileTransfer文件夹
      const [existingFolder] = await db
        .select()
        .from(fileFolders)
        .where(eq(fileFolders.name, folderName))
        .limit(1);

      if (existingFolder) {
        folder = existingFolder;
      } else {
        // 创建fileTransfer模块根文件夹
        [folder] = await db
          .insert(fileFolders)
          .values({
            id: folderId,
            name: folderName,
            path: '/filetransfer',
            moduleId: 'filetransfer',
            depth: 1,
            sortOrder: 1,
            isSystem: true,
            createdBy: 'system'
          })
          .returning();
      }

      this.folderCache.set(folderName, folder);
    }
  }

  /**
   * 备份原始数据
   */
  private async backupOldData(): Promise<void> {
    console.log('💾 [FileTransferMigrator] 备份原始数据...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupTableName = `file_transfers_backup_${timestamp}`;
    
    // 创建备份表
    await db.execute(`CREATE TABLE ${backupTableName} AS SELECT * FROM file_transfers`);
    
    console.log(`✅ [FileTransferMigrator] 数据已备份到表: ${backupTableName}`);
  }

  /**
   * 分批迁移数据
   */
  private async migrateBatch(offset: number, limit: number): Promise<{
    successCount: number;
    failureCount: number;
    skippedCount: number;
    failures: Array<{ id: string; fileName: string; error: string }>;
  }> {
    const result = {
      successCount: 0,
      failureCount: 0,
      skippedCount: 0,
      failures: [] as Array<{ id: string; fileName: string; error: string }>
    };

    // 获取批次数据
    const records = await db
      .select()
      .from(fileTransfers)
      .limit(limit)
      .offset(offset);

    for (const record of records) {
      try {
        const migrated = await this.migrateRecord(record);
        
        if (migrated) {
          result.successCount++;
        } else {
          result.skippedCount++;
        }
        
      } catch (error) {
        console.error(`❌ [FileTransferMigrator] 迁移记录失败: ${record.id}`, error);
        
        result.failureCount++;
        result.failures.push({
          id: record.id,
          fileName: record.fileName,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return result;
  }

  /**
   * 迁移单条记录
   */
  private async migrateRecord(record: any): Promise<boolean> {
    console.log(`📄 [FileTransferMigrator] 迁移记录: ${record.id} - ${record.fileName}`);

    // 1. 检查记录是否已存在
    if (!this.config.forceOverwrite) {
      const [existing] = await db
        .select()
        .from(fileMetadata)
        .where(eq(fileMetadata.id, record.id))
        .limit(1);

      if (existing) {
        console.log(`⏭️ [FileTransferMigrator] 记录已存在，跳过: ${record.id}`);
        return false;
      }
    }

    // 2. 验证文件是否存在
    if (this.config.validateFiles && !existsSync(record.filePath)) {
      throw new Error(`文件不存在: ${record.filePath}`);
    }

    // 3. 计算文件哈希
    let md5Hash: string | undefined;
    let sha256Hash: string | undefined;
    
    if (this.config.validateFiles && existsSync(record.filePath)) {
      const fileBuffer = await readFile(record.filePath);
      md5Hash = createHash('md5').update(fileBuffer).digest('hex');
      sha256Hash = createHash('sha256').update(fileBuffer).digest('hex');
    }

    // 4. 确定存储路径
    let storagePath = record.filePath;
    let storageProviderId = 'local-default';

    // TODO: 如果启用OSS上传，这里需要上传文件到OSS并获取新的路径
    if (this.config.enableOSSUpload) {
      // storagePath = await this.uploadToOSS(record.filePath);
      // storageProviderId = 'aliyun-oss';
    }

    // 5. 获取存储提供者ID
    const provider = this.storageProviderCache.get('local-default');
    if (!provider) {
      throw new Error('存储提供者未找到');
    }

    // 6. 获取文件夹ID
    const folder = this.folderCache.get('FileTransfer');
    if (!folder) {
      throw new Error('FileTransfer文件夹未找到');
    }

    // 7. 创建新的文件元数据记录
    if (!this.config.dryRun) {
      await db.insert(fileMetadata).values({
        originalName: record.fileName,
        storedName: basename(record.filePath),
        extension: extname(record.fileName).substring(1),
        mimeType: record.fileType,
        size: record.fileSize,
        md5Hash: md5Hash || '',
        sha256Hash,
        storagePath,
        storageProviderId: provider.id,
        folderId: folder.id,
        moduleId: 'filetransfer',
        businessId: null,
        tags: [],
        metadata: {
          // 保存原始的status和progress信息
          originalStatus: record.status,
          originalProgress: record.progress,
          migratedFrom: 'file_transfers',
          originalId: record.id // 保存原ID到metadata中
        },
        isTemporary: false,
        isDeleted: false,
        accessCount: 0,
        downloadCount: record.downloadCount,
        uploaderId: record.uploaderId,
        uploadTime: record.createdAt,
        lastAccessTime: null,
        expiresAt: record.expiresAt
      });
    }

    console.log(`✅ [FileTransferMigrator] 记录迁移完成: ${record.id}`);
    return true;
  }

  /**
   * 验证迁移结果
   */
  async validateMigration(): Promise<{
    isValid: boolean;
    issues: string[];
    summary: {
      originalCount: number;
      migratedCount: number;
      matchingCount: number;
    };
  }> {
    console.log('🔍 [FileTransferMigrator] 验证迁移结果...');

    const issues: string[] = [];

    // 1. 统计原始数据
    const [originalCountResult] = await db
      .select({ count: db.$count(fileTransfers) })
      .from(fileTransfers);
    const originalCount = originalCountResult.count;

    // 2. 统计迁移数据
    const [migratedCountResult] = await db
      .select({ count: db.$count(fileMetadata) })
      .from(fileMetadata)
      .where(eq(fileMetadata.moduleId, 'filetransfer'));
    const migratedCount = migratedCountResult.count;

    // 3. 检查数据一致性
    let matchingCount = 0;
    const originalRecords = await db.select().from(fileTransfers);
    
    for (const original of originalRecords) {
      const [migrated] = await db
        .select()
        .from(fileMetadata)
        .where(eq(fileMetadata.id, original.id))
        .limit(1);

      if (migrated) {
        matchingCount++;
        
        // 验证关键字段
        if (migrated.originalName !== original.fileName) {
          issues.push(`文件名不匹配: ${original.id}`);
        }
        if (migrated.size !== original.fileSize) {
          issues.push(`文件大小不匹配: ${original.id}`);
        }
        if (migrated.mimeType !== original.fileType) {
          issues.push(`文件类型不匹配: ${original.id}`);
        }
      } else {
        issues.push(`缺少迁移记录: ${original.id}`);
      }
    }

    const isValid = issues.length === 0 && originalCount === migratedCount;

    console.log('📊 [FileTransferMigrator] 验证结果:', {
      原始记录数: originalCount,
      迁移记录数: migratedCount,
      匹配记录数: matchingCount,
      问题数量: issues.length,
      验证通过: isValid
    });

    return {
      isValid,
      issues,
      summary: {
        originalCount,
        migratedCount,
        matchingCount
      }
    };
  }

  /**
   * 回滚迁移
   */
  async rollbackMigration(): Promise<void> {
    console.log('🔄 [FileTransferMigrator] 开始回滚迁移...');

    // 删除迁移的记录
    await db
      .delete(fileMetadata)
      .where(eq(fileMetadata.moduleId, 'filetransfer'));

    console.log('✅ [FileTransferMigrator] 迁移已回滚');
  }
}

/**
 * 创建迁移器实例
 */
export function createFileTransferMigrator(config?: Partial<MigrationConfig>): FileTransferMigrator {
  return new FileTransferMigrator(config);
} 
