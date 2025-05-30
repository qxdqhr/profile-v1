'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useMasterpieces } from '@/hooks/useMasterpieces';
import { getConfig } from '@/services/masterpiecesConfigService';
import { MasterpiecesConfig } from '@/types/masterpieces';
import { CollectionCard, ArtworkViewer, ThumbnailSidebar, UserMenu } from '@/components/masterpieces';
import { useAuth } from '@/hooks/useAuth';
import styles from './ShowMasterPieces.module.css';

export default function ShowMasterPieces() {
  const {
    collections,
    selectedCollection,
    currentPage,
    loading,
    error,
    getCurrentArtwork,
    canGoNext,
    canGoPrev,
    selectCollection,
    nextPage,
    prevPage,
    goToPage,
    backToGallery,
  } = useMasterpieces();

  const { isAuthenticated } = useAuth();
  const [config, setConfig] = useState<MasterpiecesConfig | null>(null);

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configData = await getConfig();
        setConfig(configData);
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    };
    loadConfig();
  }, []);

  // 处理配置页面访问
  const handleConfigAccess = () => {
    if (isAuthenticated) {
      window.location.href = '/testField/ShowMasterPieces/config';
    }
    // 如果未登录，UserMenu 组件会处理登录流程
  };

  // 加载状态
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>重新加载</button>
        </div>
      </div>
    );
  }

  // 画集详情视图
  if (selectedCollection) {
    const currentArtwork = getCurrentArtwork();
    
    return (
      <div className={styles.container}>
        {/* 顶部导航 */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerNav}>
              <button onClick={backToGallery} className={styles.backButton}>
                <ArrowLeft size={20} />
                <span>返回画集</span>
              </button>
              <div className={styles.headerTitle}>
                <h1>{selectedCollection.title}</h1>
                <p>作者：{selectedCollection.artist}</p>
              </div>
              <UserMenu onConfigAccess={handleConfigAccess} />
            </div>
          </div>
        </div>

        {/* 作品展示区域 */}
        <div className={styles.artworkContainer}>
          <div className={styles.artworkMain}>
            {currentArtwork && (
              <ArtworkViewer
                artwork={currentArtwork}
                onNext={nextPage}
                onPrev={prevPage}
                canGoNext={canGoNext}
                canGoPrev={canGoPrev}
              />
            )}
          </div>
          
          <div className={styles.artworkSidebar}>
            <ThumbnailSidebar
              pages={selectedCollection.pages}
              currentPage={currentPage}
              onPageSelect={goToPage}
            />
          </div>
        </div>
      </div>
    );
  }

  // 画集列表视图
  return (
    <div className={styles.container}>
      {/* 顶部导航 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerNav}>
            <button
              onClick={() => window.history.back()}
              className={styles.backButton}
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>
            <div className={styles.headerTitle}>
              <h1>{config?.heroTitle || '艺术画集展览馆'}</h1>
              <p>{config?.heroSubtitle || '精选世界各地艺术大师的经典作品，每一页都是一次艺术的沉浸体验'}</p>
            </div>
            <UserMenu onConfigAccess={handleConfigAccess} />
          </div>
        </div>
      </div>

      {/* 画集网格 */}
      <div className={styles.collectionsContainer}>
        <div className={styles.collectionsGrid}>
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onSelect={selectCollection}
            />
          ))}
        </div>
      </div>

      {/* 空状态 */}
      {collections.length === 0 && (
        <div className={styles.emptyState}>
          <h3>暂无画集</h3>
          <p>请前往配置页面添加画集</p>
          <button 
            onClick={handleConfigAccess}
            className={styles.configLink}
          >
            前往配置
          </button>
        </div>
      )}
    </div>
  );
}
