import { 
  masterpiecesConfigDbService,
  categoriesDbService,
  tagsDbService,
  collectionsDbService,
  artworksDbService
} from '@/db/services/masterpiecesDbService';
import type { 
  MasterpiecesConfig, 
  ArtCollection, 
  ArtworkPage,
  CollectionFormData,
  ArtworkFormData 
} from '@/types/masterpieces';

// 配置管理
export const getConfig = async (): Promise<MasterpiecesConfig> => {
  const response = await fetch('/api/masterpieces/config');
  if (!response.ok) {
    throw new Error('获取配置失败');
  }
  return await response.json();
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
  return await response.json();
};

export const resetConfig = async (): Promise<MasterpiecesConfig> => {
  const response = await fetch('/api/masterpieces/config', {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('重置配置失败');
  }
  return await response.json();
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