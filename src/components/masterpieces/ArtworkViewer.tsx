import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { ArtworkPage } from '@/types/masterpieces';
import styles from './ArtworkViewer.module.css';

interface ArtworkViewerProps {
  artwork: ArtworkPage;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export const ArtworkViewer: React.FC<ArtworkViewerProps> = ({
  artwork,
  onNext,
  onPrev,
  canGoNext,
  canGoPrev
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className={styles.artworkCard}>
      <div className={styles.artworkImageContainer}>
        {/* 图片加载状态 */}
        {imageLoading && (
          <div className={styles.imageLoading}>
            <div className={styles.loadingSpinner}></div>
            <p>加载中...</p>
          </div>
        )}

        {/* 图片错误状态 */}
        {imageError && (
          <div className={styles.imageError}>
            <ImageIcon size={48} />
            <p>图片加载失败</p>
            <button 
              onClick={() => {
                setImageError(false);
                setImageLoading(true);
              }}
              className={styles.retryButton}
            >
              重试
            </button>
          </div>
        )}

        {/* 主图片 */}
        <img
          src={artwork.image}
          alt={artwork.title}
          className={`${styles.artworkImage} ${imageLoading ? styles.hidden : ''} ${imageError ? styles.hidden : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* 翻页按钮 */}
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className={`${styles.navButton} ${styles.prevButton}`}
          aria-label="上一张"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`${styles.navButton} ${styles.nextButton}`}
          aria-label="下一张"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* 作品信息 */}
      <div className={styles.artworkInfo}>
        <h2 className={styles.artworkTitle}>{artwork.title}</h2>
        <p className={styles.artworkArtist}>创作者：{artwork.artist}</p>
        {artwork.year && (
          <p className={styles.artworkYear}>创作年代：{artwork.year}</p>
        )}
        {artwork.medium && (
          <p className={styles.artworkMedium}>材质技法：{artwork.medium}</p>
        )}
        {artwork.description && (
          <p className={styles.artworkDescription}>{artwork.description}</p>
        )}
      </div>
    </div>
  );
}; 