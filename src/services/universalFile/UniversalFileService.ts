/**
 * 通用文件服务核心实现
 * 
 * 提供统一的文件上传、下载、管理接口
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import * as path from 'path';
// import mime from 'mime-types'; // 临时注释，后续添加类型定义

// 临时mime类型解析函数
const getMimeType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
  return mimeMap[ext] || 'application/octet-stream';
};

import type {
  UniversalFileServiceConfig,
  StorageType,
  CDNType,
  ProcessorType,
  FileMetadata,
  UploadFileInfo,
  UploadProgress,
  UploadStatus,
  FileQueryOptions,
  PaginatedResult,
  BatchOperationResult,
  FileEvent,
  FileEventListener,
  IStorageProvider,
  ICDNProvider,
  IFileProcessor,
  StorageResult,
  ProcessingResult
} from './types';

import {
  FileUploadError,
  FileProcessingError,
  StorageProviderError,
  CDNProviderError
} from './types';

/**
 * 通用文件服务类
 */
export class UniversalFileService extends EventEmitter {
  private config: UniversalFileServiceConfig;
  private storageProviders = new Map<StorageType, IStorageProvider>();
  private cdnProviders = new Map<CDNType, ICDNProvider>();
  private fileProcessors = new Map<ProcessorType, IFileProcessor>();
  private uploadProgressMap = new Map<string, UploadProgress>();
  private metadataCache = new Map<string, { data: FileMetadata; expires: number }>();
  private urlCache = new Map<string, { url: string; expires: number }>();
  private processingQueue: Array<{
    fileId: string;
    processor: IFileProcessor;
    inputPath: string;
    outputPath: string;
    options: any;
  }> = [];
  private isProcessingQueueRunning = false;

  constructor(config: UniversalFileServiceConfig) {
    super();
    this.config = config;
  }

  // ============= 初始化方法 =============

  /**
   * 初始化文件服务
   */
  async initialize(): Promise<void> {
    console.log('🚀 [UniversalFileService] 开始初始化文件服务...');
    
    try {
      // 初始化存储提供者
      await this.initializeStorageProviders();
      
      // 初始化CDN提供者
      await this.initializeCDNProviders();
      
      // 初始化文件处理器
      await this.initializeFileProcessors();
      
      console.log('✅ [UniversalFileService] 文件服务初始化完成');
    } catch (error) {
      console.error('❌ [UniversalFileService] 文件服务初始化失败:', error);
      throw error;
    }
  }

  /**
   * 注册存储提供者
   */
  registerStorageProvider(provider: IStorageProvider): void {
    this.storageProviders.set(provider.type, provider);
    console.log(`📦 [UniversalFileService] 注册存储提供者: ${provider.type}`);
  }

  /**
   * 注册CDN提供者
   */
  registerCDNProvider(provider: ICDNProvider): void {
    this.cdnProviders.set(provider.type, provider);
    console.log(`🌐 [UniversalFileService] 注册CDN提供者: ${provider.type}`);
  }

  /**
   * 注册文件处理器
   */
  registerFileProcessor(processor: IFileProcessor): void {
    this.fileProcessors.set(processor.type, processor);
    console.log(`⚙️ [UniversalFileService] 注册文件处理器: ${processor.type}`);
  }

  // ============= 核心文件操作方法 =============

  /**
   * 上传文件
   */
  async uploadFile(
    fileInfo: UploadFileInfo,
    storageType?: StorageType,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileMetadata> {
    const fileId = uuidv4();
    const startTime = Date.now();

    console.log(`📤 [UniversalFileService] 开始上传文件: ${fileInfo.file.name}, ID: ${fileId}`);

    try {
      // 验证文件
      await this.validateFile(fileInfo.file);

      // 初始化上传进度
      const progress: UploadProgress = {
        fileId,
        status: 'pending',
        progress: 0,
        uploadedBytes: 0,
        totalBytes: fileInfo.file.size,
        speed: 0,
        remainingTime: 0
      };
      
      this.uploadProgressMap.set(fileId, progress);
      this.emitFileEvent('upload:start', fileId, { fileName: fileInfo.file.name });

      // 生成文件元数据
      const metadata = await this.generateFileMetadata(fileId, fileInfo);

      // 选择存储提供者
      const selectedStorageType = storageType || this.config.defaultStorage;
      const storageProvider = this.storageProviders.get(selectedStorageType);
      
      if (!storageProvider) {
        throw new StorageProviderError(`存储提供者不存在: ${selectedStorageType}`);
      }

      // 生成存储路径
      const storagePath = this.generateStoragePath(metadata);

      // 更新上传状态
      progress.status = 'uploading';
      progress.progress = 10;
      this.uploadProgressMap.set(fileId, progress);
      onProgress?.(progress);
      this.emitFileEvent('upload:progress', fileId, { progress: progress.progress });

      // 执行上传
      const uploadResult = await storageProvider.upload(fileInfo, storagePath);
      
      if (!uploadResult.success) {
        throw new FileUploadError(`上传失败: ${uploadResult.error}`);
      }

      // 更新元数据
      metadata.storagePath = uploadResult.path || storagePath;
      metadata.storageProvider = selectedStorageType;

      // 生成CDN URL（如果启用）
      if (this.config.defaultCDN !== 'none') {
        const cdnProvider = this.cdnProviders.get(this.config.defaultCDN);
        if (cdnProvider && uploadResult.url) {
          metadata.cdnUrl = await cdnProvider.generateUrl(uploadResult.url);
        }
      }

      // 更新上传进度
      progress.status = fileInfo.needsProcessing ? 'processing' : 'completed';
      progress.progress = fileInfo.needsProcessing ? 70 : 100;
      this.uploadProgressMap.set(fileId, progress);
      onProgress?.(progress);

      // 如果需要处理，添加到处理队列
      if (fileInfo.needsProcessing && fileInfo.processingOptions) {
        await this.queueFileProcessing(metadata, fileInfo.processingOptions);
      }

      // 保存到数据库（这里需要实现数据库操作）
      await this.saveFileMetadata(metadata);

      // 缓存元数据
      this.cacheMetadata(metadata);

      // 完成上传
      progress.status = 'completed';
      progress.progress = 100;
      this.uploadProgressMap.set(fileId, progress);
      onProgress?.(progress);

      const uploadTime = Date.now() - startTime;
      console.log(`✅ [UniversalFileService] 文件上传完成: ${fileId}, 耗时: ${uploadTime}ms`);
      
      this.emitFileEvent('upload:complete', fileId, {
        fileName: fileInfo.file.name,
        size: fileInfo.file.size,
        uploadTime
      });

      return metadata;

    } catch (error) {
      console.error(`❌ [UniversalFileService] 文件上传失败: ${fileId}:`, error);
      
      // 更新上传状态为失败
      const progress = this.uploadProgressMap.get(fileId);
      if (progress) {
        progress.status = 'failed';
        progress.error = error instanceof Error ? error.message : '上传失败';
        this.uploadProgressMap.set(fileId, progress);
        onProgress?.(progress);
      }

      this.emitFileEvent('upload:error', fileId, undefined, error instanceof Error ? error.message : '上传失败');
      throw error;
    } finally {
      // 清理上传进度（可选，或设置过期时间）
      setTimeout(() => {
        this.uploadProgressMap.delete(fileId);
      }, 5 * 60 * 1000); // 5分钟后清理
    }
  }

  /**
   * 下载文件
   */
  async downloadFile(fileId: string, userId?: string): Promise<Buffer> {
    console.log(`📥 [UniversalFileService] 开始下载文件: ${fileId}`);
    
    try {
      this.emitFileEvent('download:start', fileId);

      // 获取文件元数据
      const metadata = await this.getFileMetadata(fileId);
      
      if (!metadata) {
        throw new FileUploadError(`文件不存在: ${fileId}`);
      }

      // 检查权限
      await this.checkFileAccess(metadata, userId);

      // 获取存储提供者
      const storageProvider = this.storageProviders.get(metadata.storageProvider);
      
      if (!storageProvider) {
        throw new StorageProviderError(`存储提供者不存在: ${metadata.storageProvider}`);
      }

      // 下载文件
      const fileBuffer = await storageProvider.download(metadata.storagePath);

      // 更新访问统计
      await this.updateAccessStats(fileId);

      console.log(`✅ [UniversalFileService] 文件下载完成: ${fileId}`);
      this.emitFileEvent('download:complete', fileId, { size: fileBuffer.length });

      return fileBuffer;

    } catch (error) {
      console.error(`❌ [UniversalFileService] 文件下载失败: ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string, userId?: string): Promise<void> {
    console.log(`🗑️ [UniversalFileService] 开始删除文件: ${fileId}`);
    
    try {
      // 获取文件元数据
      const metadata = await this.getFileMetadata(fileId);
      
      if (!metadata) {
        throw new FileUploadError(`文件不存在: ${fileId}`);
      }

      // 检查删除权限
      await this.checkFileDeleteAccess(metadata, userId);

      // 获取存储提供者
      const storageProvider = this.storageProviders.get(metadata.storageProvider);
      
      if (!storageProvider) {
        throw new StorageProviderError(`存储提供者不存在: ${metadata.storageProvider}`);
      }

      // 从存储中删除文件
      const deleteResult = await storageProvider.delete(metadata.storagePath);
      
      if (!deleteResult.success) {
        console.warn(`⚠️ [UniversalFileService] 存储文件删除失败: ${deleteResult.error}`);
      }

      // 从数据库中删除元数据
      await this.deleteFileMetadata(fileId);

      // 清除缓存
      this.clearMetadataCache(fileId);

      console.log(`✅ [UniversalFileService] 文件删除完成: ${fileId}`);
      this.emitFileEvent('delete:complete', fileId);

    } catch (error) {
      console.error(`❌ [UniversalFileService] 文件删除失败: ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * 获取文件访问URL
   */
  async getFileUrl(fileId: string, userId?: string, expiresIn?: number): Promise<string> {
    // 检查缓存
    const cacheKey = `${fileId}_${userId || 'public'}_${expiresIn || 0}`;
    const cached = this.urlCache.get(cacheKey);
    
    if (cached && cached.expires > Date.now()) {
      return cached.url;
    }

    // 获取文件元数据
    const metadata = await this.getFileMetadata(fileId);
    
    if (!metadata) {
      throw new FileUploadError(`文件不存在: ${fileId}`);
    }

    // 检查访问权限
    await this.checkFileAccess(metadata, userId);

    let url: string;

    // 优先使用CDN URL
    if (metadata.cdnUrl) {
      url = metadata.cdnUrl;
    } else {
      // 获取存储提供者访问URL
      const storageProvider = this.storageProviders.get(metadata.storageProvider);
      
      if (!storageProvider) {
        throw new StorageProviderError(`存储提供者不存在: ${metadata.storageProvider}`);
      }

      url = await storageProvider.getAccessUrl(metadata.storagePath, expiresIn);
    }

    // 缓存URL
    const cacheExpires = Date.now() + (this.config.cache.urlTTL * 1000);
    this.urlCache.set(cacheKey, { url, expires: cacheExpires });

    return url;
  }

  // ============= 查询和管理方法 =============

  /**
   * 查询文件列表
   */
  async queryFiles(options: FileQueryOptions): Promise<PaginatedResult<FileMetadata>> {
    // 这里需要实现数据库查询逻辑
    // 暂时返回空结果
    return {
      items: [],
      total: 0,
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    };
  }

  /**
   * 批量删除文件
   */
  async batchDeleteFiles(fileIds: string[], userId?: string): Promise<BatchOperationResult> {
    const result: BatchOperationResult = {
      successCount: 0,
      failureCount: 0,
      failures: []
    };

    for (const fileId of fileIds) {
      try {
        await this.deleteFile(fileId, userId);
        result.successCount++;
      } catch (error) {
        result.failureCount++;
        result.failures.push({
          fileId,
          error: error instanceof Error ? error.message : '删除失败'
        });
      }
    }

    return result;
  }

  /**
   * 获取上传进度
   */
  getUploadProgress(fileId: string): UploadProgress | undefined {
    return this.uploadProgressMap.get(fileId);
  }

  // ============= 事件处理方法 =============

  /**
   * 监听文件事件
   */
  onFileEvent(eventType: string, listener: FileEventListener): void {
    this.on(eventType, listener);
  }

  /**
   * 移除文件事件监听器
   */
  offFileEvent(eventType: string, listener: FileEventListener): void {
    this.off(eventType, listener);
  }

  // ============= 私有方法 =============

  private async initializeStorageProviders(): Promise<void> {
    console.log('📦 [UniversalFileService] 开始初始化存储提供者...');
    
    // 如果还没有注册任何存储提供者，先注册默认的
    if (this.storageProviders.size === 0) {
      await this.registerDefaultStorageProviders();
    }
    
    for (const [type, config] of Object.entries(this.config.storageProviders)) {
      if (config.enabled) {
        const provider = this.storageProviders.get(type as StorageType);
        if (provider) {
          try {
            await provider.initialize(config);
            console.log(`✅ [UniversalFileService] 存储提供者初始化完成: ${type}`);
          } catch (error) {
            console.warn(`⚠️ [UniversalFileService] 存储提供者初始化失败: ${type}:`, error);
            // 如果默认存储提供者初始化失败，切换到本地存储
            // if (type === this.config.defaultStorage) {
            //   console.warn(`⚠️ [UniversalFileService] 默认存储提供者 ${type} 初始化失败，切换到本地存储`);
            //   this.config.defaultStorage = 'local';
            // }
          }
        } else {
          console.warn(`⚠️ [UniversalFileService] 存储提供者未注册: ${type}`);
        }
      }
    }
  }

  private async registerDefaultStorageProviders(): Promise<void> {
    console.log('📦 [UniversalFileService] 注册默认存储提供者...');
    
    // 注册本地存储提供者
    const { LocalStorageProvider } = await import('./providers/LocalStorageProvider');
    const localProvider = new LocalStorageProvider();
    this.registerStorageProvider(localProvider);
    
    // 如果配置了阿里云OSS，注册OSS提供者
    const ossConfig = this.config.storageProviders['aliyun-oss'];
    if (ossConfig && ossConfig.enabled) {
      try {
        const { AliyunOSSProvider } = await import('./providers/AliyunOSSProvider');
        const ossProvider = new AliyunOSSProvider();
        this.registerStorageProvider(ossProvider);
        console.log('✅ [UniversalFileService] 阿里云OSS提供者注册成功');
      } catch (error) {
        console.warn('⚠️ [UniversalFileService] 阿里云OSS提供者注册失败:', error);
        // 如果OSS注册失败，确保至少有一个可用的存储提供者
        if (this.storageProviders.size === 0) {
          console.warn('⚠️ [UniversalFileService] 没有可用的存储提供者，将使用本地存储');
          this.config.defaultStorage = 'local';
        }
      }
    }
  }

  private async initializeCDNProviders(): Promise<void> {
    for (const [type, config] of Object.entries(this.config.cdnProviders)) {
      if (config.enabled) {
        const provider = this.cdnProviders.get(type as CDNType);
        if (provider) {
          await provider.initialize(config);
          console.log(`✅ [UniversalFileService] CDN提供者初始化完成: ${type}`);
        }
      }
    }
  }

  private async initializeFileProcessors(): Promise<void> {
    for (const processor of Array.from(this.fileProcessors.values())) {
      await processor.initialize();
      console.log(`✅ [UniversalFileService] 文件处理器初始化完成: ${processor.type}`);
    }
  }

  private async validateFile(file: File): Promise<void> {
    // 检查文件大小
    if (file.size > this.config.maxFileSize) {
      throw new FileUploadError(`文件大小超过限制: ${file.size} > ${this.config.maxFileSize}`);
    }

    // 检查文件类型
    const mimeType = file.type || getMimeType(file.name);
    
    if (this.config.allowedMimeTypes.length > 0 && !this.config.allowedMimeTypes.includes(mimeType)) {
      throw new FileUploadError(`不支持的文件类型: ${mimeType}`);
    }
  }

  private async generateFileMetadata(fileId: string, fileInfo: UploadFileInfo): Promise<FileMetadata> {
    const now = new Date();
    const mimeType = fileInfo.file.type || getMimeType(fileInfo.file.name);
    const extension = path.extname(fileInfo.file.name).toLowerCase();

    // 生成文件哈希（用于去重检测）
    const hash = await this.generateFileHash(fileInfo.file);

    return {
      id: fileId,
      originalName: fileInfo.file.name,
      storageName: `${fileId}${extension}`,
      size: fileInfo.file.size,
      mimeType,
      extension,
      hash,
      uploadTime: now,
      permission: fileInfo.permission || 'private',
      uploaderId: fileInfo.metadata?.uploadedBy || 'system',
      moduleId: fileInfo.moduleId,
      businessId: fileInfo.businessId,
      storageProvider: this.config.defaultStorage,
      storagePath: '',
      accessCount: 0,
      metadata: fileInfo.metadata || {}
    };
  }

  private generateStoragePath(metadata: FileMetadata): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${metadata.moduleId}/${year}/${month}/${day}/${metadata.storageName}`;
  }

  private async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hash = createHash('sha256');
    hash.update(Buffer.from(buffer));
    return hash.digest('hex');
  }

  private async queueFileProcessing(metadata: FileMetadata, options: any): Promise<void> {
    if (!this.config.enableProcessing) {
      return;
    }

    const processor = this.fileProcessors.get(options.type);
    if (!processor) {
      console.warn(`⚠️ [UniversalFileService] 文件处理器不存在: ${options.type}`);
      return;
    }

    if (this.processingQueue.length >= this.config.processingQueueSize) {
      throw new FileProcessingError('处理队列已满');
    }

    this.processingQueue.push({
      fileId: metadata.id,
      processor,
      inputPath: metadata.storagePath,
      outputPath: this.generateProcessedPath(metadata, options),
      options
    });

    // 启动处理队列
    if (!this.isProcessingQueueRunning) {
      this.processFileQueue();
    }
  }

  private generateProcessedPath(metadata: FileMetadata, options: any): string {
    const basePath = metadata.storagePath;
    const extension = path.extname(basePath);
    const basename = basePath.replace(extension, '');
    
    return `${basename}_processed${extension}`;
  }

  private async processFileQueue(): Promise<void> {
    if (this.isProcessingQueueRunning || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessingQueueRunning = true;

    while (this.processingQueue.length > 0) {
      const task = this.processingQueue.shift();
      if (!task) break;

      try {
        this.emitFileEvent('processing:start', task.fileId);
        
        const result = await task.processor.process(
          task.inputPath,
          task.outputPath,
          task.options
        );

        if (result.success) {
          this.emitFileEvent('processing:complete', task.fileId, result);
        } else {
          this.emitFileEvent('processing:error', task.fileId, undefined, result.error);
        }
      } catch (error) {
        console.error(`❌ [UniversalFileService] 文件处理失败: ${task.fileId}:`, error);
        this.emitFileEvent('processing:error', task.fileId, undefined, 
          error instanceof Error ? error.message : '处理失败');
      }
    }

    this.isProcessingQueueRunning = false;
  }

  private cacheMetadata(metadata: FileMetadata): void {
    const expires = Date.now() + (this.config.cache.metadataTTL * 1000);
    this.metadataCache.set(metadata.id, { data: metadata, expires });
  }

  private clearMetadataCache(fileId: string): void {
    this.metadataCache.delete(fileId);
  }

  private emitFileEvent(type: string, fileId: string, data?: any, error?: string): void {
    const event: FileEvent = {
      type: type as any,
      fileId,
      timestamp: new Date(),
      data,
      error
    };
    
    this.emit(type, event);
    this.emit('*', event); // 通用事件监听
  }

  // ============= 数据库操作方法 =============

  private async saveFileMetadata(metadata: FileMetadata): Promise<void> {
    try {
      // 导入数据库相关模块
      const { db } = await import('@/db/index');
      const { fileMetadata } = await import('./db/schema');
      const { eq } = await import('drizzle-orm');
      
      // 获取默认存储提供者ID
      const { fileStorageProviders } = await import('./db/schema');
      const [defaultProvider] = await db
        .select()
        .from(fileStorageProviders)
        .where(eq(fileStorageProviders.isDefault, true))
        .limit(1);
      
      if (!defaultProvider) {
        throw new Error('未找到默认存储提供者');
      }

      // 保存到数据库
      await db.insert(fileMetadata).values({
        id: metadata.id,
        originalName: metadata.originalName,
        storedName: metadata.storageName,
        extension: metadata.extension,
        mimeType: metadata.mimeType,
        size: metadata.size,
        md5Hash: metadata.hash?.substring(0, 32) || '',
        sha256Hash: metadata.hash || '',
        storageProviderId: defaultProvider.id,
        storagePath: metadata.storagePath,
        cdnUrl: metadata.cdnUrl,
        moduleId: metadata.moduleId,
        businessId: metadata.businessId,
        tags: [],
        metadata: metadata.metadata,
        isTemporary: false,
        isDeleted: false,
        accessCount: metadata.accessCount,
        downloadCount: 0,
        uploaderId: metadata.uploaderId || 'system',
        uploadTime: metadata.uploadTime,
        lastAccessTime: metadata.lastAccessTime,
        expiresAt: metadata.expiresAt
      });

      console.log('💾 [UniversalFileService] 文件元数据保存成功:', metadata.id);
    } catch (error) {
      console.error('❌ [UniversalFileService] 保存文件元数据失败:', error);
      throw new FileUploadError(`保存文件元数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    // 检查缓存
    const cached = this.metadataCache.get(fileId);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    try {
      // 导入数据库相关模块
      const { db } = await import('@/db/index');
      const { fileMetadata, fileStorageProviders } = await import('./db/schema');
      const { eq } = await import('drizzle-orm');

      // 查询数据库
      const [record] = await db
        .select()
        .from(fileMetadata)
        .where(eq(fileMetadata.id, fileId))
        .limit(1);

      if (!record) {
        console.log('🔍 [UniversalFileService] 文件元数据不存在:', fileId);
        return null;
      }

      // 查询存储提供者信息
      const [provider] = await db
        .select()
        .from(fileStorageProviders)
        .where(eq(fileStorageProviders.id, record.storageProviderId))
        .limit(1);

      if (!provider) {
        console.log('🔍 [UniversalFileService] 存储提供者不存在:', record.storageProviderId);
        return null;
      }

      // 转换为FileMetadata格式
      const metadata: FileMetadata = {
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
        metadata: record.metadata || {}
      };

      // 缓存结果
      this.cacheMetadata(metadata);

      console.log('🔍 [UniversalFileService] 文件元数据查询成功:', fileId);
      return metadata;
    } catch (error) {
      console.error('❌ [UniversalFileService] 查询文件元数据失败:', error);
      return null;
    }
  }

  private async deleteFileMetadata(fileId: string): Promise<void> {
    try {
      // 导入数据库相关模块
      const { db } = await import('@/db/index');
      const { fileMetadata } = await import('./db/schema');
      const { eq } = await import('drizzle-orm');

      // 软删除：标记为已删除
      await db
        .update(fileMetadata)
        .set({ 
          isDeleted: true, 
          deletedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(fileMetadata.id, fileId));

      // 清除缓存
      this.clearMetadataCache(fileId);

      console.log('🗑️ [UniversalFileService] 文件元数据删除成功:', fileId);
    } catch (error) {
      console.error('❌ [UniversalFileService] 删除文件元数据失败:', error);
      throw new FileUploadError(`删除文件元数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private async updateAccessStats(fileId: string): Promise<void> {
    try {
      // 导入数据库相关模块
      const { db } = await import('@/db/index');
      const { fileMetadata } = await import('./db/schema');
      const { eq, sql } = await import('drizzle-orm');

      // 更新访问统计
      await db
        .update(fileMetadata)
        .set({ 
          accessCount: sql`${fileMetadata.accessCount} + 1`,
          lastAccessTime: new Date(),
          updatedAt: new Date()
        })
        .where(eq(fileMetadata.id, fileId));

      console.log('📊 [UniversalFileService] 访问统计更新成功:', fileId);
    } catch (error) {
      console.error('❌ [UniversalFileService] 更新访问统计失败:', error);
    }
  }

  private async checkFileAccess(metadata: FileMetadata, userId?: string): Promise<void> {
    // 如果文件是公开的，允许访问
    if (metadata.permission === 'public') {
      return;
    }
    
    // 如果是私有文件，检查用户权限
    if (metadata.permission === 'private' && metadata.uploaderId !== userId) {
      throw new FileUploadError('无权限访问此文件');
    }
  }

  private async checkFileDeleteAccess(metadata: FileMetadata, userId?: string): Promise<void> {
    // TODO: 实现删除权限检查逻辑
    if (metadata.uploaderId !== userId) {
      throw new FileUploadError('无权限删除此文件');
    }
  }
} 