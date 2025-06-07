import { 
  masterpiecesConfigDbService,
  categoriesDbService,
  tagsDbService,
  collectionsDbService,
  artworksDbService
} from '../db/masterpiecesDbService';
import type { 
  MasterpiecesConfig, 
  ArtCollection, 
  ArtworkPage,
  CollectionFormData,
  ArtworkFormData 
} from '../types';

// 配置缓存
let configCache: MasterpiecesConfig | null = null;
let configCacheTime: number = 0;
const CONFIG_CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 配置管理
export const getConfig = async (): Promise<MasterpiecesConfig> => {
  // 检查缓存是否有效
  const now = Date.now();
  if (configCache && (now - configCacheTime) < CONFIG_CACHE_DURATION) {
    return configCache;
  }

  const response = await fetch('/api/masterpieces/config');
  if (!response.ok) {
    throw new Error('获取配置失败');
  }
  
  const config = await response.json();
  
  // 更新缓存
  configCache = config;
  configCacheTime = now;
  
  return config;
};

export const updateConfig = async (configData: Partial<MasterpiecesConfig>): Promise<MasterpiecesConfig> => {
  const response = await fetch('/api/masterpieces/config', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(configData),
  });
  
  if (!response.ok) {
    throw new Error('更新配置失败');
  }
  
  const updatedConfig = await response.json();
  
  // 更新缓存
  configCache = updatedConfig;
  configCacheTime = Date.now();
  
  return updatedConfig;
};

export const resetConfig = async (): Promise<MasterpiecesConfig> => {
  const response = await fetch('/api/masterpieces/config', {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('重置配置失败');
  }
  
  const resetConfigData = await response.json();
  
  // 清除缓存
  configCache = resetConfigData;
  configCacheTime = Date.now();
  
  return resetConfigData;
};

// 画集管理
export const getAllCollections = async (): Promise<ArtCollection[]> => {
  const response = await fetch('/api/masterpieces/collections');
  if (!response.ok) {
    throw new Error('获取画集失败');
  }
  return await response.json();
};

export const createCollection = async (collectionData: CollectionFormData): Promise<ArtCollection> => {
  const response = await fetch('/api/masterpieces/collections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(collectionData),
  });
  
  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('图片文件太大，请选择更小的图片或等待图片压缩完成后重试');
    }
    throw new Error('创建画集失败');
  }
  return await response.json();
};

export const updateCollection = async (id: number, collectionData: CollectionFormData): Promise<ArtCollection> => {
  const response = await fetch(`/api/masterpieces/collections/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(collectionData),
  });
  
  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('图片文件太大，请选择更小的图片或等待图片压缩完成后重试');
    }
    throw new Error('更新画集失败');
  }
  return await response.json();
};

export const deleteCollection = async (id: number): Promise<void> => {
  const response = await fetch(`/api/masterpieces/collections/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('删除画集失败');
  }
};

// 作品管理
export const addArtworkToCollection = async (collectionId: number, artworkData: ArtworkFormData): Promise<ArtworkPage> => {
  const response = await fetch(`/api/masterpieces/collections/${collectionId}/artworks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(artworkData),
  });
  
  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('图片文件太大，请选择更小的图片或等待图片压缩完成后重试');
    }
    throw new Error('添加作品失败');
  }
  return await response.json();
};

export const updateArtwork = async (collectionId: number, artworkId: number, artworkData: ArtworkFormData): Promise<ArtworkPage> => {
  const response = await fetch(`/api/masterpieces/collections/${collectionId}/artworks/${artworkId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(artworkData),
  });
  
  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('图片文件太大，请选择更小的图片或等待图片压缩完成后重试');
    }
    throw new Error('更新作品失败');
  }
  return await response.json();
};

export const deleteArtwork = async (collectionId: number, artworkId: number): Promise<void> => {
  const response = await fetch(`/api/masterpieces/collections/${collectionId}/artworks/${artworkId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('删除作品失败');
  }
};

// 分类和标签
export const getCategories = async (): Promise<string[]> => {
  const response = await fetch('/api/masterpieces/categories');
  if (!response.ok) {
    throw new Error('获取分类失败');
  }
  return await response.json();
};

export const getTags = async (): Promise<string[]> => {
  const response = await fetch('/api/masterpieces/tags');
  if (!response.ok) {
    throw new Error('获取标签失败');
  }
  return await response.json();
};

// 获取画集概览（不包含作品详情，用于列表展示）
export async function getCollectionsOverview(): Promise<Omit<ArtCollection, 'pages'>[]> {
  const response = await fetch('/api/masterpieces/collections?overview=true');
  if (!response.ok) {
    throw new Error('获取画集概览失败');
  }
  return response.json();
} 