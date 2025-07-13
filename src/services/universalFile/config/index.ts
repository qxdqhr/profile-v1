/**
 * 通用文件服务配置管理
 */

import type {
  UniversalFileServiceConfig,
  StorageType,
  CDNType,
  LocalStorageConfig,
  AliyunOSSConfig,
  AliyunCDNConfig,
  StorageConfig,
  CDNConfig
} from '../types';

/**
 * 默认配置
 */
const DEFAULT_CONFIG: UniversalFileServiceConfig = {
  defaultStorage: 'local',
  storageProviders: {
    'local': {
      type: 'local',
      enabled: true,
      rootPath: process.env.FILE_STORAGE_PATH || 'uploads',
      baseUrl: process.env.FILE_BASE_URL || '/uploads'
    } as LocalStorageConfig,
    'aliyun-oss': {
      type: 'aliyun-oss',
      enabled: false,
      region: '',
      bucket: '',
      accessKeyId: '',
      accessKeySecret: ''
    } as AliyunOSSConfig,
    'aws-s3': {
      type: 'aws-s3',
      enabled: false
    } as StorageConfig,
    'qcloud-cos': {
      type: 'qcloud-cos',
      enabled: false
    } as StorageConfig
  },
  defaultCDN: 'none',
  cdnProviders: {
    'none': {
      type: 'none',
      enabled: false
    } as CDNConfig,
    'aliyun-cdn': {
      type: 'aliyun-cdn',
      enabled: false,
      domain: '',
      accessKeyId: '',
      accessKeySecret: ''
    } as AliyunCDNConfig,
    'aws-cloudfront': {
      type: 'aws-cloudfront',
      enabled: false
    } as CDNConfig,
    'qcloud-cdn': {
      type: 'qcloud-cdn',
      enabled: false
    } as CDNConfig
  },
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB
  allowedMimeTypes: [
    // 图片类型
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // 音频类型
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/aac',
    // 视频类型
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/webm',
    'video/mkv',
    // 文档类型
    'application/pdf',
    'text/plain',
    'application/json',
    'application/javascript',
    'text/css',
    'text/html',
    'text/markdown',
    // 压缩文件
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    // 3D模型文件
    'application/octet-stream', // PMD/PMX文件
    'model/gltf+json',
    'model/gltf-binary'
  ],
  enableProcessing: process.env.ENABLE_FILE_PROCESSING === 'true',
  processingQueueSize: parseInt(process.env.PROCESSING_QUEUE_SIZE || '10'),
  cache: {
    metadataTTL: parseInt(process.env.METADATA_CACHE_TTL || '3600'), // 1小时
    urlTTL: parseInt(process.env.URL_CACHE_TTL || '1800') // 30分钟
  }
};

/**
 * 配置管理器
 */
export class FileServiceConfigManager {
  private config: UniversalFileServiceConfig;

  constructor(customConfig?: Partial<UniversalFileServiceConfig>) {
    this.config = this.mergeConfig(DEFAULT_CONFIG, customConfig);
    this.validateConfig();
  }

  /**
   * 获取完整配置
   */
  getConfig(): UniversalFileServiceConfig {
    return { ...this.config };
  }

  /**
   * 获取存储提供者配置
   */
  getStorageConfig(type: StorageType): StorageConfig | undefined {
    return this.config.storageProviders[type];
  }

  /**
   * 获取CDN提供者配置
   */
  getCDNConfig(type: CDNType): CDNConfig | undefined {
    return this.config.cdnProviders[type];
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<UniversalFileServiceConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
    this.validateConfig();
  }

  /**
   * 启用存储提供者
   */
  enableStorageProvider(type: StorageType, config?: Partial<StorageConfig>): void {
    if (this.config.storageProviders[type]) {
      this.config.storageProviders[type] = {
        ...this.config.storageProviders[type],
        ...config,
        enabled: true
      };
    }
  }

  /**
   * 禁用存储提供者
   */
  disableStorageProvider(type: StorageType): void {
    if (this.config.storageProviders[type]) {
      this.config.storageProviders[type].enabled = false;
    }
  }

  /**
   * 启用CDN提供者
   */
  enableCDNProvider(type: CDNType, config?: Partial<CDNConfig>): void {
    if (this.config.cdnProviders[type]) {
      this.config.cdnProviders[type] = {
        ...this.config.cdnProviders[type],
        ...config,
        enabled: true
      };
      this.config.defaultCDN = type;
    }
  }

  /**
   * 禁用CDN提供者
   */
  disableCDNProvider(type: CDNType): void {
    if (this.config.cdnProviders[type]) {
      this.config.cdnProviders[type].enabled = false;
      if (this.config.defaultCDN === type) {
        this.config.defaultCDN = 'none';
      }
    }
  }

  /**
   * 从环境变量加载阿里云OSS配置
   */
  loadAliyunOSSFromEnv(): void {
    const config: Partial<AliyunOSSConfig> = {
      region: process.env.ALIYUN_OSS_REGION,
      bucket: process.env.ALIYUN_OSS_BUCKET,
      accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET,
      customDomain: process.env.ALIYUN_OSS_CUSTOM_DOMAIN,
      secure: process.env.ALIYUN_OSS_SECURE === 'true',
      internal: process.env.ALIYUN_OSS_INTERNAL === 'true'
    };

    // 检查必需的配置项
    if (config.region && config.bucket && config.accessKeyId && config.accessKeySecret) {
      this.enableStorageProvider('aliyun-oss', config);
      this.config.defaultStorage = 'aliyun-oss';
      console.log('✅ [ConfigManager] 从环境变量加载阿里云OSS配置成功');
    } else {
      console.warn('⚠️ [ConfigManager] 阿里云OSS环境变量配置不完整');
    }
  }

  /**
   * 从环境变量加载阿里云CDN配置
   */
  loadAliyunCDNFromEnv(): void {
    const config: Partial<AliyunCDNConfig> = {
      domain: process.env.ALIYUN_CDN_DOMAIN,
      accessKeyId: process.env.ALIYUN_CDN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_CDN_ACCESS_KEY_SECRET,
      region: process.env.ALIYUN_CDN_REGION
    };

    // 检查必需的配置项
    if (config.domain && config.accessKeyId && config.accessKeySecret) {
      this.enableCDNProvider('aliyun-cdn', config);
      console.log('✅ [ConfigManager] 从环境变量加载阿里云CDN配置成功');
    } else {
      console.warn('⚠️ [ConfigManager] 阿里云CDN环境变量配置不完整');
    }
  }

  /**
   * 验证配置有效性
   */
  private validateConfig(): void {
    // 检查默认存储提供者是否启用
    const defaultStorageConfig = this.config.storageProviders[this.config.defaultStorage];
    if (!defaultStorageConfig || !defaultStorageConfig.enabled) {
      console.warn(`⚠️ [ConfigManager] 默认存储提供者 ${this.config.defaultStorage} 未启用`);
    }

    // 检查文件大小限制
    if (this.config.maxFileSize <= 0) {
      throw new Error('文件大小限制必须大于0');
    }

    // 检查处理队列大小
    if (this.config.processingQueueSize <= 0) {
      throw new Error('处理队列大小必须大于0');
    }

    // 检查缓存TTL
    if (this.config.cache.metadataTTL <= 0 || this.config.cache.urlTTL <= 0) {
      throw new Error('缓存TTL必须大于0');
    }
  }

  /**
   * 合并配置
   */
  private mergeConfig(
    base: UniversalFileServiceConfig,
    override?: Partial<UniversalFileServiceConfig>
  ): UniversalFileServiceConfig {
    if (!override) return { ...base };

    return {
      ...base,
      ...override,
      storageProviders: {
        ...base.storageProviders,
        ...(override.storageProviders || {})
      },
      cdnProviders: {
        ...base.cdnProviders,
        ...(override.cdnProviders || {})
      },
      cache: {
        ...base.cache,
        ...(override.cache || {})
      }
    };
  }
}

/**
 * 创建默认配置管理器
 */
export function createFileServiceConfig(customConfig?: Partial<UniversalFileServiceConfig>): FileServiceConfigManager {
  const configManager = new FileServiceConfigManager(customConfig);
  
  // 尝试从环境变量加载云服务配置
  configManager.loadAliyunOSSFromEnv();
  configManager.loadAliyunCDNFromEnv();
  
  return configManager;
}

/**
 * 获取默认配置
 */
export function getDefaultConfig(): UniversalFileServiceConfig {
  return { ...DEFAULT_CONFIG };
}

/**
 * 验证阿里云OSS配置
 */
export function validateAliyunOSSConfig(config: AliyunOSSConfig): boolean {
  return !!(
    config.region &&
    config.bucket &&
    config.accessKeyId &&
    config.accessKeySecret
  );
}

/**
 * 验证阿里云CDN配置
 */
export function validateAliyunCDNConfig(config: AliyunCDNConfig): boolean {
  return !!(
    config.domain &&
    config.accessKeyId &&
    config.accessKeySecret
  );
}

/**
 * 格式化文件大小显示
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 检查文件类型是否支持
 */
export function isMimeTypeSupported(mimeType: string, allowedTypes: string[]): boolean {
  if (allowedTypes.length === 0) return true;
  return allowedTypes.includes(mimeType);
}

/**
 * 生成存储提供者显示名称
 */
export function getStorageProviderDisplayName(type: StorageType): string {
  const names: Record<StorageType, string> = {
    'local': '本地存储',
    'aliyun-oss': '阿里云OSS',
    'aws-s3': 'AWS S3',
    'qcloud-cos': '腾讯云COS'
  };
  
  return names[type] || type;
}

/**
 * 生成CDN提供者显示名称
 */
export function getCDNProviderDisplayName(type: CDNType): string {
  const names: Record<CDNType, string> = {
    'none': '无CDN',
    'aliyun-cdn': '阿里云CDN',
    'aws-cloudfront': 'AWS CloudFront',
    'qcloud-cdn': '腾讯云CDN'
  };
  
  return names[type] || type;
} 