/**
 * ShowMasterpiece模块 - 文件服务配置
 * 
 * 为ShowMasterpiece模块提供特定的文件服务配置和帮助函数
 */

import { createFileServiceConfig } from '@/services/universalFile/config';

// 缓存ConfigManager实例，避免重复创建
let cachedConfigManager: ReturnType<typeof createFileServiceConfig> | null = null;

/**
 * 获取缓存的ConfigManager实例
 */
function getCachedConfigManager() {
  if (!cachedConfigManager) {
    cachedConfigManager = createFileServiceConfig();
  }
  return cachedConfigManager;
}

/**
 * 获取ShowMasterpiece模块的文件服务配置
 */
export function getShowMasterpieceFileConfig() {
  const configManager = getCachedConfigManager();
  
  // 检查是否有OSS配置，如果有则优先使用OSS
  const config = configManager.getConfig();
  const ossConfig = config.storageProviders['aliyun-oss'];
  
  if (ossConfig && ossConfig.enabled) {
    console.log('✅ [ShowMasterpiece] 使用阿里云OSS存储');
    return configManager;
  } else {
    console.log('ℹ️ [ShowMasterpiece] OSS未配置，使用本地存储');
    return configManager;
  }
}

/**
 * 上传ShowMasterpiece作品图片
 */
export async function uploadArtworkImage(file: File, collectionId?: number): Promise<{
  fileId: string;
  accessUrl: string;
}> {
  console.log('🎨 [ShowMasterpiece] 开始上传作品图片:', file.name);
  
  // 创建FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('moduleId', 'showmasterpiece');
  formData.append('businessId', collectionId ? `collection-${collectionId}` : 'artwork');
  formData.append('folderPath', collectionId ? `showmasterpiece/collection-${collectionId}` : 'showmasterpiece/artwork');
  formData.append('needsProcessing', 'true');
  
  // 调用通用文件上传API
  const response = await fetch('/api/universal-file/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || '上传失败');
  }
  
  console.log('✅ [ShowMasterpiece] 作品图片上传成功:', {
    fileId: result.data.fileId,
    accessUrl: result.data.accessUrl
  });
  
  return {
    fileId: result.data.fileId,
    accessUrl: result.data.accessUrl
  };
}

/**
 * 获取作品图片访问URL
 */
export async function getArtworkImageUrl(fileId: string): Promise<string> {
  console.log('🔗 [ShowMasterpiece] 获取作品图片URL:', fileId);
  
  const response = await fetch(`/api/universal-file/${fileId}`);
  
  if (!response.ok) {
    throw new Error(`获取文件URL失败: HTTP ${response.status}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || '获取文件URL失败');
  }
  
  return result.data.accessUrl;
}

/**
 * 检查是否应该使用通用文件服务
 * 
 * 策略：
 * 1. 如果已经配置了OSS，新上传默认使用文件服务
 * 2. 如果只有本地存储，可以选择使用文件服务进行统一管理
 * 3. 兼容旧的Base64存储方式
 */
export function shouldUseUniversalFileService(): boolean {
  try {
    const configManager = getCachedConfigManager();
    
    const config = configManager.getConfig();
    const ossConfig = config.storageProviders['aliyun-oss'];
    
    // 如果OSS已配置且启用，推荐使用文件服务
    if (ossConfig && ossConfig.enabled) {
      return true;
    }
    
    // 即使只有本地存储，也推荐使用文件服务进行统一管理
    // 这样可以享受文件去重、缓存、统计等功能
    return true;
    
  } catch (error) {
    console.warn('⚠️ [ShowMasterpiece] 检查文件服务配置失败:', error);
    return false;
  }
}

/**
 * 获取存储模式显示名称
 */
export function getStorageModeDisplayName(): string {
  if (shouldUseUniversalFileService()) {
    const configManager = getCachedConfigManager();
    
    const config = configManager.getConfig();
    const ossConfig = config.storageProviders['aliyun-oss'];
    
    if (ossConfig && ossConfig.enabled) {
      return '阿里云OSS + CDN';
    } else {
      return '本地存储 + 文件服务';
    }
  } else {
    return 'Base64数据库存储';
  }
} 