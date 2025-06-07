import { useState, useEffect, useCallback } from 'react';
import { ArtCollection } from '@/types/masterpieces';
import { MasterpiecesService } from '@/services/masterpiecesService';

// 数据缓存
let collectionsCache: ArtCollection[] | null = null;
let collectionsCacheTime: number = 0;
const COLLECTIONS_CACHE_DURATION = 3 * 60 * 1000; // 3分钟缓存

export const useMasterpieces = () => {
  const [collections, setCollections] = useState<ArtCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<ArtCollection | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载所有画集
  const loadCollections = useCallback(async (forceRefresh = false) => {
    try {
      // 检查缓存是否有效
      const now = Date.now();
      if (!forceRefresh && collectionsCache && (now - collectionsCacheTime) < COLLECTIONS_CACHE_DURATION) {
        setCollections(collectionsCache);
        return;
      }

      setLoading(true);
      setError(null);
      const data = await MasterpiecesService.getAllCollections();
      
      // 更新缓存
      collectionsCache = data;
      collectionsCacheTime = now;
      
      setCollections(data);
    } catch (err) {
      setError('加载画集失败');
      console.error('Error loading collections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 选择画集
  const selectCollection = useCallback((collection: ArtCollection) => {
    setSelectedCollection(collection);
    setCurrentPage(0);
  }, []);

  // 下一页
  const nextPage = useCallback(() => {
    if (selectedCollection && currentPage < selectedCollection.pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  }, [selectedCollection, currentPage]);

  // 上一页
  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  // 跳转到指定页面
  const goToPage = useCallback((pageIndex: number) => {
    if (selectedCollection && pageIndex >= 0 && pageIndex < selectedCollection.pages.length) {
      setCurrentPage(pageIndex);
    }
  }, [selectedCollection]);

  // 返回画集库
  const backToGallery = useCallback(() => {
    setSelectedCollection(null);
    setCurrentPage(0);
  }, []);

  // 搜索画集
  const searchCollections = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await MasterpiecesService.searchCollections(query);
      setCollections(data);
    } catch (err) {
      setError('搜索失败');
      console.error('Error searching collections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取当前作品
  const getCurrentArtwork = useCallback(() => {
    if (!selectedCollection || !selectedCollection.pages[currentPage]) {
      return null;
    }
    return selectedCollection.pages[currentPage];
  }, [selectedCollection, currentPage]);

  // 检查是否可以翻页
  const canGoNext = selectedCollection ? currentPage < selectedCollection.pages.length - 1 : false;
  const canGoPrev = currentPage > 0;

  // 初始化加载
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  return {
    // 状态
    collections,
    selectedCollection,
    currentPage,
    loading,
    error,
    
    // 计算属性
    getCurrentArtwork,
    canGoNext,
    canGoPrev,
    
    // 操作方法
    selectCollection,
    nextPage,
    prevPage,
    goToPage,
    backToGallery,
    searchCollections,
    loadCollections,
  };
}; 