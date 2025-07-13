/**
 * 阿里云OSS存储提供者实现
 */

const OSS = require('ali-oss');
import { Readable } from 'stream';

import type {
  IStorageProvider,
  StorageConfig,
  AliyunOSSConfig,
  StorageResult,
  UploadFileInfo,
  StorageType
} from '../types';

import { StorageProviderError } from '../types';

/**
 * 阿里云OSS存储提供者
 */
export class AliyunOSSProvider implements IStorageProvider {
  readonly type: StorageType = 'aliyun-oss';
  
  private config: AliyunOSSConfig | null = null;
  private client: any = null;
  private isInitialized = false;

  /**
   * 初始化存储提供者
   */
  async initialize(config: StorageConfig): Promise<void> {
    if (config.type !== 'aliyun-oss') {
      throw new StorageProviderError('配置类型不匹配：期望 aliyun-oss');
    }

    this.config = config as AliyunOSSConfig;
    
    console.log(`☁️ [AliyunOSSProvider] 初始化阿里云OSS，区域: ${this.config.region}, 存储桶: ${this.config.bucket}`);

    try {
      // 验证必需的配置项
      this.validateConfig();

      // 创建OSS客户端
      this.client = new OSS({
        region: this.config.region,
        bucket: this.config.bucket,
        accessKeyId: this.config.accessKeyId,
        accessKeySecret: this.config.accessKeySecret,
        secure: this.config.secure !== false, // 默认使用HTTPS
        internal: this.config.internal || false, // 默认使用公网
        timeout: 300000, // 5分钟超时
        cname: !!this.config.customDomain, // 是否使用自定义域名
        endpoint: this.config.customDomain || undefined
      });

      // 测试连接
      await this.testConnection();
      
      this.isInitialized = true;
      console.log('✅ [AliyunOSSProvider] 阿里云OSS初始化完成');
      
    } catch (error) {
      console.error('❌ [AliyunOSSProvider] 阿里云OSS初始化失败:', error);
      throw new StorageProviderError(
        `阿里云OSS初始化失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 上传文件
   */
  async upload(fileInfo: UploadFileInfo, filePath: string): Promise<StorageResult> {
    this.ensureInitialized();
    
    const startTime = Date.now();
    console.log(`📤 [AliyunOSSProvider] 开始上传文件到OSS: ${filePath}`);

    try {
      // 将File对象转换为Buffer
      const buffer = Buffer.from(await fileInfo.file.arrayBuffer());
      
      // 构建上传选项
      const options: any = {
        headers: {
          'Content-Type': fileInfo.file.type || 'application/octet-stream',
          'Content-Length': fileInfo.file.size.toString(),
        },
        meta: {
          uid: 0, // 必需字段
          pid: 0, // 必需字段
          originalName: encodeURIComponent(fileInfo.file.name),
          moduleId: fileInfo.moduleId,
          businessId: fileInfo.businessId || '',
          uploadTime: new Date().toISOString(),
          ...fileInfo.metadata
        }
      };

      // 根据文件大小选择上传方式
      let result: any;
      
      if (fileInfo.file.size > 100 * 1024 * 1024) { // 大于100MB使用分片上传
        console.log(`📦 [AliyunOSSProvider] 使用分片上传大文件: ${filePath}, 大小: ${fileInfo.file.size}`);
        result = await this.multipartUpload(filePath, buffer, options);
      } else {
        console.log(`📤 [AliyunOSSProvider] 使用普通上传: ${filePath}, 大小: ${fileInfo.file.size}`);
        result = await this.client.put(filePath, buffer, options);
      }

      // 生成访问URL
      const accessUrl = this.generateAccessUrl(filePath);
      
      const uploadTime = Date.now() - startTime;
      console.log(`✅ [AliyunOSSProvider] 文件上传完成: ${filePath}, 耗时: ${uploadTime}ms`);

      return {
        success: true,
        path: filePath,
        url: accessUrl,
        size: fileInfo.file.size,
        data: {
          etag: result.data ? JSON.stringify(result.data) : '',
          requestId: result.res?.rt || 0,
          uploadTime,
          ossUrl: result.url || result.name
        }
      };

    } catch (error) {
      console.error(`❌ [AliyunOSSProvider] 文件上传失败: ${filePath}:`, error);
      
      return {
        success: false,
        error: this.formatOSSError(error)
      };
    }
  }

  /**
   * 下载文件
   */
  async download(filePath: string): Promise<Buffer> {
    this.ensureInitialized();
    
    console.log(`📥 [AliyunOSSProvider] 开始从OSS下载文件: ${filePath}`);

    try {
      const result = await this.client.get(filePath);
      
      if (!result.content || !Buffer.isBuffer(result.content)) {
        throw new StorageProviderError('下载的文件内容格式错误');
      }

      console.log(`✅ [AliyunOSSProvider] 文件下载完成: ${filePath}, 大小: ${result.content.length}`);
      
      return result.content;

    } catch (error) {
      console.error(`❌ [AliyunOSSProvider] 文件下载失败: ${filePath}:`, error);
      
      if (this.isOSSError(error) && error.code === 'NoSuchKey') {
        throw new StorageProviderError(`文件不存在: ${filePath}`);
      }
      
      throw new StorageProviderError(
        `文件下载失败: ${this.formatOSSError(error)}`
      );
    }
  }

  /**
   * 删除文件
   */
  async delete(filePath: string): Promise<StorageResult> {
    this.ensureInitialized();
    
    console.log(`🗑️ [AliyunOSSProvider] 开始从OSS删除文件: ${filePath}`);

    try {
      const result = await this.client.delete(filePath);
      
      console.log(`✅ [AliyunOSSProvider] 文件删除完成: ${filePath}`);
      
      return {
        success: true,
        data: {
          requestId: result.res?.rt || 0,
          deletedPath: filePath
        }
      };

    } catch (error) {
      console.error(`❌ [AliyunOSSProvider] 文件删除失败: ${filePath}:`, error);
      
      // OSS中删除不存在的文件不会报错，但我们统一处理
      if (this.isOSSError(error) && error.code === 'NoSuchKey') {
        console.warn(`⚠️ [AliyunOSSProvider] 文件不存在: ${filePath}`);
        return {
          success: true,
          data: { reason: 'file_not_exists' }
        };
      }
      
      return {
        success: false,
        error: this.formatOSSError(error)
      };
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(filePath: string): Promise<StorageResult> {
    this.ensureInitialized();
    
    try {
      const result = await this.client.head(filePath);
      
      return {
        success: true,
        size: parseInt(String(result.meta['content-length'] || '0')),
        data: {
          etag: result.meta.etag || '',
          lastModified: result.meta['last-modified'] || '',
          contentType: result.meta['content-type'],
          meta: result.meta,
          size: parseInt(String(result.meta['content-length'] || '0'))
        }
      };

    } catch (error) {
      if (this.isOSSError(error) && error.code === 'NoSuchKey') {
        return {
          success: false,
          error: '文件不存在'
        };
      }
      
      return {
        success: false,
        error: this.formatOSSError(error)
      };
    }
  }

  /**
   * 生成访问URL
   */
  async getAccessUrl(filePath: string, expiresIn?: number): Promise<string> {
    this.ensureInitialized();
    
    try {
      // 如果使用自定义域名，直接返回公开URL
      if (this.config!.customDomain) {
        return this.generateAccessUrl(filePath);
      }

      // 生成带过期时间的签名URL
      const expires = expiresIn || 3600; // 默认1小时
      const signedUrl = this.client.signatureUrl(filePath, {
        expires,
        method: 'GET'
      });
      
      return signedUrl;

    } catch (error) {
      console.error(`❌ [AliyunOSSProvider] 生成访问URL失败: ${filePath}:`, error);
      throw new StorageProviderError(
        `生成访问URL失败: ${this.formatOSSError(error)}`
      );
    }
  }

  /**
   * 生成预签名上传URL
   */
  async getUploadUrl(filePath: string, expiresIn?: number): Promise<string> {
    this.ensureInitialized();
    
    try {
      const expires = expiresIn || 3600; // 默认1小时
      const signedUrl = this.client.signatureUrl(filePath, {
        expires,
        method: 'PUT'
      });
      
      return signedUrl;

    } catch (error) {
      console.error(`❌ [AliyunOSSProvider] 生成上传URL失败: ${filePath}:`, error);
      throw new StorageProviderError(
        `生成上传URL失败: ${this.formatOSSError(error)}`
      );
    }
  }

  /**
   * 检查文件是否存在
   */
  async exists(filePath: string): Promise<boolean> {
    this.ensureInitialized();
    
    try {
      await this.client.head(filePath);
      return true;
    } catch (error) {
      if (this.isOSSError(error) && error.code === 'NoSuchKey') {
        return false;
      }
      // 其他错误也视为文件不存在
      console.warn(`⚠️ [AliyunOSSProvider] 检查文件存在性时出错: ${filePath}:`, error);
      return false;
    }
  }

  /**
   * 列出文件
   */
  async list(prefix: string, maxKeys?: number): Promise<string[]> {
    this.ensureInitialized();
    
    try {
      const options: any = {
        prefix,
        'max-keys': String(maxKeys || 1000)
      };

      const result = await this.client.list(options);
      
      return result.objects?.map((obj: any) => obj.name) || [];

    } catch (error) {
      console.error(`❌ [AliyunOSSProvider] 列出文件失败: ${prefix}:`, error);
      return [];
    }
  }

  // ============= 私有方法 =============

  /**
   * 确保已初始化
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.client || !this.config) {
      throw new StorageProviderError('OSS存储提供者未初始化');
    }
  }

  /**
   * 验证配置
   */
  private validateConfig(): void {
    if (!this.config) {
      throw new StorageProviderError('OSS配置为空');
    }

    const required = ['region', 'bucket', 'accessKeyId', 'accessKeySecret'];
    const missing = required.filter(key => !this.config![key as keyof AliyunOSSConfig]);
    
    if (missing.length > 0) {
      throw new StorageProviderError(`OSS配置缺少必需项: ${missing.join(', ')}`);
    }
  }

  /**
   * 测试连接
   */
  private async testConnection(): Promise<void> {
    try {
      // 尝试列出少量对象来测试连接
      await this.client.list({
        'max-keys': '1'
      });
      console.log(`✅ [AliyunOSSProvider] OSS连接测试成功`);
    } catch (error) {
      if (this.isOSSError(error)) {
        if (error.code === 'NoSuchBucket') {
          throw new StorageProviderError(`存储桶不存在: ${this.config!.bucket}`);
        }
        if (error.code === 'InvalidAccessKeyId') {
          throw new StorageProviderError('Access Key ID 无效');
        }
        if (error.code === 'SignatureDoesNotMatch') {
          throw new StorageProviderError('Access Key Secret 无效');
        }
      }
      throw error;
    }
  }

  /**
   * 分片上传大文件
   */
  private async multipartUpload(
    filePath: string,
    buffer: Buffer,
    options: any
  ): Promise<any> {
    console.log(`📦 [AliyunOSSProvider] 使用多分片上传`);

    // 使用OSS的multipartUpload方法
    const result = await this.client.multipartUpload(filePath, buffer, {
      partSize: 10 * 1024 * 1024, // 10MB per chunk
      parallel: 4, // 并发数
      progress: (p: number) => {
        if (p % 0.1 < 0.01) { // 每10%显示一次进度
          console.log(`📦 [AliyunOSSProvider] 上传进度: ${(p * 100).toFixed(1)}%`);
        }
      },
      meta: options.meta,
      headers: options.headers
    });

    return {
      name: result.name,
      url: result.name, // OSS返回的是object名称
      data: result.data,
      res: result.res
    };
  }

  /**
   * 生成公开访问URL
   */
  private generateAccessUrl(filePath: string): string {
    if (!this.config) {
      throw new StorageProviderError('OSS配置为空');
    }

    if (this.config.customDomain) {
      // 使用自定义域名
      const protocol = this.config.secure !== false ? 'https' : 'http';
      return `${protocol}://${this.config.customDomain}/${filePath}`;
    } else {
      // 使用默认OSS域名
      const protocol = this.config.secure !== false ? 'https' : 'http';
      return `${protocol}://${this.config.bucket}.${this.config.region}.aliyuncs.com/${filePath}`;
    }
  }

  /**
   * 判断是否为OSS错误
   */
  private isOSSError(error: any): error is { code: string; name: string; message: string; requestId?: string } {
    return error && typeof error.code === 'string' && typeof error.name === 'string';
  }

  /**
   * 格式化OSS错误信息
   */
  private formatOSSError(error: any): string {
    if (this.isOSSError(error)) {
      return `${error.code}: ${error.message}${error.requestId ? ` (RequestId: ${error.requestId})` : ''}`;
    }
    return error instanceof Error ? error.message : '未知错误';
  }

  /**
   * 流式上传（可选实现）
   */
  async uploadStream(
    readableStream: NodeJS.ReadableStream,
    filePath: string,
    contentType?: string,
    contentLength?: number
  ): Promise<StorageResult> {
    this.ensureInitialized();
    
    const startTime = Date.now();
    console.log(`📤 [AliyunOSSProvider] 开始流式上传文件到OSS: ${filePath}`);

    try {
      const options: any = {
        timeout: 300000,
        mime: contentType || 'application/octet-stream',
        meta: { uid: 0, pid: 0 },
        callback: { url: '', body: '' },
        headers: {} as any
      };

      if (contentLength) {
        options.headers['Content-Length'] = contentLength.toString();
      }

      const result = await this.client.putStream(filePath, readableStream, options);
      
      const accessUrl = this.generateAccessUrl(filePath);
      
      const uploadTime = Date.now() - startTime;
      console.log(`✅ [AliyunOSSProvider] 流式上传完成: ${filePath}, 耗时: ${uploadTime}ms`);

      return {
        success: true,
        path: filePath,
        url: accessUrl,
        size: contentLength,
        data: {
          name: result.name,
          requestId: result.res?.rt || 0,
          uploadTime,
          ossUrl: result.url || result.name
        }
      };

    } catch (error) {
      console.error(`❌ [AliyunOSSProvider] 流式上传失败: ${filePath}:`, error);
      
      return {
        success: false,
        error: this.formatOSSError(error)
      };
    }
  }

  /**
   * 批量删除文件
   */
  async batchDelete(filePaths: string[]): Promise<StorageResult> {
    this.ensureInitialized();
    
    console.log(`🗑️ [AliyunOSSProvider] 开始批量删除文件，数量: ${filePaths.length}`);

    try {
      const result = await this.client.deleteMulti(filePaths, {
        quiet: false // 返回删除结果
      });
      
      console.log(`✅ [AliyunOSSProvider] 批量删除完成，成功: ${result.deleted?.length || 0}`);
      
      return {
        success: true,
        data: {
          deleted: result.deleted,
          requestId: result.res?.rt || 0
        }
      };

    } catch (error) {
      console.error(`❌ [AliyunOSSProvider] 批量删除失败:`, error);
      
      return {
        success: false,
        error: this.formatOSSError(error)
      };
    }
  }

  /**
   * 复制文件
   */
  async copy(sourcePath: string, targetPath: string): Promise<StorageResult> {
    this.ensureInitialized();
    
    console.log(`📋 [AliyunOSSProvider] 开始复制文件: ${sourcePath} -> ${targetPath}`);

    try {
      const result = await this.client.copy(targetPath, sourcePath);
      
      console.log(`✅ [AliyunOSSProvider] 文件复制完成: ${sourcePath} -> ${targetPath}`);
      
      return {
        success: true,
        data: {
          etag: result.data?.etag,
          lastModified: result.data?.lastModified,
          requestId: result.res?.rt || 0
        }
      };

    } catch (error) {
      console.error(`❌ [AliyunOSSProvider] 文件复制失败: ${sourcePath} -> ${targetPath}:`, error);
      
      return {
        success: false,
        error: this.formatOSSError(error)
      };
    }
  }
} 