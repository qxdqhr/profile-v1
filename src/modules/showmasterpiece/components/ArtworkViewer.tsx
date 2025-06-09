import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { ArtworkPage } from '../types';
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
  const [imageSrc, setImageSrc] = useState<string>('');

  // 🚀 图片懒加载逻辑
  useEffect(() => {
    const loadImage = async () => {
      setImageLoading(true);
      setImageError(false);
      
      try {
        // 如果已有图片数据，直接使用
        if (artwork.image && artwork.image.trim() !== '') {
          setImageSrc(artwork.image);
          setImageLoading(false);
          return;
        }
        
        // 否则通过懒加载API获取图片
        if (artwork.imageUrl) {
          const response = await fetch(artwork.imageUrl);
          if (response.ok) {
            // 对于base64图片，API返回的是图片流，需要转换为blob URL
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setImageSrc(imageUrl);
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } else {
          throw new Error('无图片数据');
        }
      } catch (error) {
        console.error('图片加载失败:', error);
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    loadImage();

    // 清理函数：释放blob URL
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [artwork.id, artwork.image, artwork.imageUrl]); // 当作品ID或图片数据变化时重新加载

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const retryImageLoad = () => {
    setImageError(false);
    setImageLoading(true);
    // 重新触发useEffect中的图片加载逻辑
    const currentSrc = imageSrc;
    setImageSrc('');
    setTimeout(() => {
      if (currentSrc.startsWith('blob:')) {
        URL.revokeObjectURL(currentSrc);
      }
    }, 100);
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
              onClick={retryImageLoad}
              className={styles.retryButton}
            >
              重试
            </button>
          </div>
        )}

        {/* 主图片 - 只有在有图片源且未出错时才显示 */}
        {imageSrc && !imageError && (
          <img
            src={imageSrc}
            alt={artwork.title}
            className={`${styles.artworkImage} ${imageLoading ? styles.hidden : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
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
        {artwork.createdTime && (
          <p className={styles.artworkYear}>创作时间：{artwork.createdTime}</p>
        )}
        {artwork.theme && (
          <p className={styles.artworkMedium}>主题：{artwork.theme}</p>
        )}
        {artwork.description && (
          <p className={styles.artworkDescription}>{artwork.description}</p>
        )}
      </div>
    </div>
  );
}; 