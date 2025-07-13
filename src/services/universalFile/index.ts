/**
 * 通用文件服务模块入口
 */

// 导出核心服务类
export { UniversalFileService } from './UniversalFileService';

// 导出配置管理
export {
  FileServiceConfigManager,
  createFileServiceConfig,
  getDefaultConfig,
  validateAliyunOSSConfig,
  validateAliyunCDNConfig,
  formatFileSize,
  isMimeTypeSupported,
  getStorageProviderDisplayName,
  getCDNProviderDisplayName
} from './config';

// 导出所有类型
export type * from './types';

// 导出异常类
export {
  FileServiceError,
  FileUploadError,
  FileProcessingError,
  StorageProviderError,
  CDNProviderError
} from './types';

// 导出常量
export const UNIVERSAL_FILE_SERVICE_VERSION = '1.0.0';
export const UNIVERSAL_FILE_SERVICE_NAME = '@profile-v1/universal-file-service'; 