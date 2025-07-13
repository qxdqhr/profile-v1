/**
 * 文件传输业务逻辑服务 - 渐进式重构版本
 * 
 * 保持原有API兼容性，逐步集成通用文件服务功能
 */

import { fileTransferDbService } from '../db/fileTransferDbService';
import { CacheManager } from '@/services/universalFile/cache/CacheManager';
import { PerformanceMonitor } from '@/services/universalFile/monitoring/PerformanceMonitor';
import type { FileTransfer, FileTransferConfig, TransferStatus } from '../types';
import { validateFileType, validateFileSize } from '../utils/fileValidation';

export class FileTransferService {
  private cacheManager: CacheManager;
  private performanceMonitor: PerformanceMonitor;

  constructor() {
    this.cacheManager = new CacheManager({
      defaultTTL: 300, // 5分钟
      maxMemoryItems: 1000,
      keyPrefix: 'filetransfer:'
    });
    this.performanceMonitor = new PerformanceMonitor();
  }

  /**
   * 验证文件是否符合上传要求
   */
  async validateFile(file: File, config?: FileTransferConfig): Promise<{
    valid: boolean;
    message?: string;
  }> {
    const startTime = Date.now();
    console.log('🔍 [FileTransferService] 验证文件:', { 
      name: file.name, 
      size: file.size, 
      type: file.type 
    });

    try {
      // 获取配置（如果没有提供）
      if (!config) {
        config = await this.getDefaultConfig();
      }

      // 验证文件大小
      if (!validateFileSize(file.size, config.maxFileSize)) {
        const maxSizeMB = Math.round(config.maxFileSize / 1024 / 1024);
        return {
          valid: false,
          message: `文件大小不能超过 ${maxSizeMB}MB`
        };
      }

      // 验证文件类型
      if (!validateFileType(file.type, config.allowedFileTypes)) {
        return {
          valid: false,
          message: '不支持的文件类型'
        };
      }

      console.log('✅ [FileTransferService] 文件验证通过');
      return { valid: true };

    } finally {
      this.performanceMonitor.recordMetric('validateFile_duration', Date.now() - startTime, 'ms');
    }
  }

  /**
   * 处理文件上传
   */
  async uploadFile(file: File, userId: string): Promise<FileTransfer> {
    const startTime = Date.now();
    console.log('📤 [FileTransferService] 开始处理文件上传');

    try {
      // 验证文件
      const validation = await this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // 使用原有的数据库服务创建传输记录
      const transfer = await fileTransferDbService.createTransfer({
        file,
        userId
      });

      console.log('✅ [FileTransferService] 文件上传成功:', transfer.id);
      
      // 记录性能指标
      this.performanceMonitor.recordMetric('uploadFile_duration', Date.now() - startTime, 'ms');
      this.performanceMonitor.recordMetric('uploadFile_size', file.size, 'bytes');
      
      return transfer;
      
    } catch (error) {
      console.error('💥 [FileTransferService] 文件上传失败:', error);
      this.performanceMonitor.recordMetric('uploadFile_error', 1, 'count');
      throw new Error('文件上传失败');
    }
  }

  /**
   * 获取用户的文件传输列表
   */
  async getUserTransfers(
    userId: string, 
    options: {
      page?: number;
      limit?: number;
      status?: TransferStatus;
    } = {}
  ): Promise<FileTransfer[]> {
    const startTime = Date.now();
    console.log('📋 [FileTransferService] 获取用户传输列表:', { userId, options });

    const { page = 1, limit = 10, status } = options;
    const cacheKey = `user_transfers:${userId}:${page}:${limit}:${status || 'all'}`;

    try {
      // 尝试从缓存获取
      const cached = await this.cacheManager.get<FileTransfer[]>(cacheKey);
      if (cached) {
        console.log('🎯 [FileTransferService] 从缓存获取传输列表');
        this.performanceMonitor.recordMetric('getUserTransfers_cache_hit', 1, 'count');
        return cached;
      }

      // 从数据库查询
      const transfers = await fileTransferDbService.getTransfers({
        userId,
        page,
        limit,
        status
      });

      // 转换格式
      const formattedTransfers = transfers.map(transfer => ({
        ...transfer,
        createdAt: transfer.createdAt.toISOString(),
        updatedAt: transfer.updatedAt.toISOString(),
        expiresAt: transfer.expiresAt?.toISOString()
      }));

      // 缓存结果（5分钟）
      await this.cacheManager.set(cacheKey, formattedTransfers, 300);

      console.log('✅ [FileTransferService] 获取传输列表成功:', formattedTransfers.length);
      this.performanceMonitor.recordMetric('getUserTransfers_duration', Date.now() - startTime, 'ms');
      
      return formattedTransfers;
      
    } catch (error) {
      console.error('💥 [FileTransferService] 获取传输列表失败:', error);
      this.performanceMonitor.recordMetric('getUserTransfers_error', 1, 'count');
      throw new Error('获取传输列表失败');
    }
  }

  /**
   * 根据ID获取文件传输记录
   */
  async getTransferById(id: string, userId?: string): Promise<FileTransfer | null> {
    const startTime = Date.now();
    console.log('🔍 [FileTransferService] 获取传输记录:', { id, userId });

    try {
      const transfer = await fileTransferDbService.getTransferById(id, userId);

      if (!transfer) {
        return null;
      }

      const formattedTransfer = {
        ...transfer,
        createdAt: transfer.createdAt.toISOString(),
        updatedAt: transfer.updatedAt.toISOString(),
        expiresAt: transfer.expiresAt?.toISOString()
      };

      this.performanceMonitor.recordMetric('getTransferById_duration', Date.now() - startTime, 'ms');
      
      return formattedTransfer;
      
    } catch (error) {
      console.error('💥 [FileTransferService] 获取传输记录失败:', error);
      this.performanceMonitor.recordMetric('getTransferById_error', 1, 'count');
      return null;
    }
  }

  /**
   * 删除文件传输记录
   */
  async deleteTransfer(id: string, userId: string): Promise<void> {
    const startTime = Date.now();
    console.log('🗑️ [FileTransferService] 删除传输记录:', { id, userId });

    try {
      await fileTransferDbService.deleteTransfer(id, userId);

      // 清除相关缓存
      await this.clearUserTransfersCache(userId);

      console.log('✅ [FileTransferService] 传输记录删除成功');
      this.performanceMonitor.recordMetric('deleteTransfer_duration', Date.now() - startTime, 'ms');
      
    } catch (error) {
      console.error('💥 [FileTransferService] 删除传输记录失败:', error);
      this.performanceMonitor.recordMetric('deleteTransfer_error', 1, 'count');
      throw new Error('删除传输记录失败');
    }
  }

  /**
   * 记录文件下载
   */
  async recordDownload(id: string): Promise<void> {
    const startTime = Date.now();
    console.log('📥 [FileTransferService] 记录文件下载:', id);

    try {
      await fileTransferDbService.incrementDownloadCount(id);

      console.log('✅ [FileTransferService] 下载记录成功');
      this.performanceMonitor.recordMetric('recordDownload_duration', Date.now() - startTime, 'ms');
      
    } catch (error) {
      console.error('💥 [FileTransferService] 记录下载失败:', error);
      this.performanceMonitor.recordMetric('recordDownload_error', 1, 'count');
      // 下载记录失败不应该阻止下载，所以不抛出错误
    }
  }

  /**
   * 获取默认配置
   */
  async getDefaultConfig(): Promise<FileTransferConfig> {
    const cacheKey = 'default_config';
    
    // 尝试从缓存获取
    const cached = await this.cacheManager.get<FileTransferConfig>(cacheKey);
    if (cached) {
      return cached;
    }

    // 默认配置
    const config: FileTransferConfig = {
      id: 'default',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB
      allowedFileTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed',
        'application/json',
        'application/javascript',
        'text/css',
        'text/html'
      ],
      defaultExpirationDays: parseInt(process.env.DEFAULT_EXPIRATION_DAYS || '7'),
      enableEncryption: process.env.ENABLE_ENCRYPTION === 'true',
      enableCompression: process.env.ENABLE_COMPRESSION === 'true',
      storagePath: process.env.FILE_STORAGE_PATH || 'uploads'
    };

    // 缓存配置（1小时）
    await this.cacheManager.set(cacheKey, config, 3600);
    
    return config;
  }

  /**
   * 清除用户传输列表缓存
   */
  private async clearUserTransfersCache(userId: string): Promise<void> {
    const pattern = `user_transfers:${userId}:*`;
    
    try {
      // 清除匹配的缓存键
      await this.cacheManager.deletePattern(pattern);
    } catch (error) {
      console.error('清除缓存失败:', error);
    }
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return this.performanceMonitor.getStats();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return this.cacheManager.getStats();
  }
}

// 导出服务实例
export const fileTransferService = new FileTransferService();