import { useState, useEffect } from 'react';
import { 
  getConfig,
  updateConfig,
  resetConfig,
  getAllCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addArtworkToCollection,
  updateArtwork,
  deleteArtwork,
  getCategories,
  getTags
} from '../services/masterpiecesConfigService';
import type { 
  MasterpiecesConfig, 
  ArtCollection, 
  CollectionFormData, 
  ArtworkFormData 
} from '../types';

export const useMasterpiecesConfig = () => {
  const [config, setConfig] = useState<MasterpiecesConfig | null>(null);
  const [collections, setCollections] = useState<ArtCollection[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载初始数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [configData, collectionsData, categoriesData, tagsData] = await Promise.all([
        getConfig(),
        getAllCollections(),
        getCategories(),
        getTags()
      ]);
      
      setConfig(configData);
      setCollections(collectionsData);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 配置管理
  const handleUpdateConfig = async (configData: Partial<MasterpiecesConfig>) => {
    try {
      const updatedConfig = await updateConfig(configData);
      setConfig(updatedConfig);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '更新配置失败');
    }
  };

  const handleResetConfig = async () => {
    try {
      const resetConfigData = await resetConfig();
      setConfig(resetConfigData);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '重置配置失败');
    }
  };

  // 画集管理
  const handleCreateCollection = async (collectionData: CollectionFormData) => {
    try {
      const newCollection = await createCollection(collectionData);
      setCollections(prev => [newCollection, ...prev]);
      
      // 更新分类和标签列表
      await refreshCategoriesAndTags();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '创建画集失败');
    }
  };

  const handleUpdateCollection = async (id: number, collectionData: CollectionFormData) => {
    try {
      const updatedCollection = await updateCollection(id, collectionData);
      setCollections(prev => prev.map(c => c.id === id ? updatedCollection : c));
      
      // 更新分类和标签列表
      await refreshCategoriesAndTags();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '更新画集失败');
    }
  };

  const handleDeleteCollection = async (id: number) => {
    try {
      await deleteCollection(id);
      setCollections(prev => prev.filter(c => c.id !== id));
      
      // 更新分类和标签列表
      await refreshCategoriesAndTags();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '删除画集失败');
    }
  };

  // 作品管理
  const handleAddArtworkToCollection = async (collectionId: number, artworkData: ArtworkFormData) => {
    try {
      const newArtwork = await addArtworkToCollection(collectionId, artworkData);
      setCollections(prev => prev.map(c => 
        c.id === collectionId 
          ? { ...c, pages: [...c.pages, newArtwork] }
          : c
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '添加作品失败');
    }
  };

  const handleUpdateArtwork = async (collectionId: number, artworkId: number, artworkData: ArtworkFormData) => {
    try {
      const updatedArtwork = await updateArtwork(collectionId, artworkId, artworkData);
      setCollections(prev => prev.map(c => 
        c.id === collectionId 
          ? { 
              ...c, 
              pages: c.pages.map(p => p.id === artworkId ? updatedArtwork : p)
            }
          : c
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '更新作品失败');
    }
  };

  const handleDeleteArtwork = async (collectionId: number, artworkId: number) => {
    try {
      await deleteArtwork(collectionId, artworkId);
      setCollections(prev => prev.map(c => 
        c.id === collectionId 
          ? { ...c, pages: c.pages.filter(p => p.id !== artworkId) }
          : c
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '删除作品失败');
    }
  };

  // 刷新分类和标签
  const refreshCategoriesAndTags = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        getCategories(),
        getTags()
      ]);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (err) {
      console.error('刷新分类和标签失败:', err);
    }
  };

  return {
    // 数据
    config,
    collections,
    categories,
    tags,
    loading,
    error,
    
    // 方法
    updateConfig: handleUpdateConfig,
    resetConfig: handleResetConfig,
    createCollection: handleCreateCollection,
    updateCollection: handleUpdateCollection,
    deleteCollection: handleDeleteCollection,
    addArtworkToCollection: handleAddArtworkToCollection,
    updateArtwork: handleUpdateArtwork,
    deleteArtwork: handleDeleteArtwork,
    refreshData: loadData,
  };
}; 