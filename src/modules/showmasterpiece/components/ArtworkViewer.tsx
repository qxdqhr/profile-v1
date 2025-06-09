import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { ArtworkPage } from '../types';
import { ImagePreloadService } from '../services/imagePreloadService';
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
  const [isLoadingHighRes, setIsLoadingHighRes] = useState(false);

  // 🚀 优化的图片加载逻辑：渐进式加载（缩略图 -> 高清图）
  useEffect(() => {
    const loadImage = async () => {
      setImageLoading(true);
      setImageError(false);
      setIsLoadingHighRes(false);
      
      try {
        const preloadService = ImagePreloadService.getInstance();
        
        // 🚀 第一阶段：快速显示大缩略图作为占位符
        if (artwork.thumbnailLarge && artwork.thumbnailLarge.trim() !== '') {
          setImageSrc(artwork.thumbnailLarge);
          setImageLoading(false);
          // 继续加载高清图
          setIsLoadingHighRes(true);
        } else if (artwork.thumbnailMedium && artwork.thumbnailMedium.trim() !== '') {
          setImageSrc(artwork.thumbnailMedium);
          setImageLoading(false);
          setIsLoadingHighRes(true);
        }

        // 🚀 第二阶段：加载高清原始图片
        if (artwork.image && artwork.image.trim() !== '') {
          // 如果有缩略图，延迟加载高清图避免闪烁
          if (artwork.thumbnailLarge || artwork.thumbnailMedium) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          setImageSrc(artwork.image);
          setIsLoadingHighRes(false);
          setImageLoading(false);
          return;
        }
        
        // 🚀 第三阶段：通过API懒加载原始图片
        if (artwork.imageUrl) {
          // 检查是否已预加载
          if (preloadService.isImagePreloaded(artwork.imageUrl)) {
            const preloadedImg = preloadService.getPreloadedImage(artwork.imageUrl);
            if (preloadedImg) {
              setImageSrc(preloadedImg.src);
              setIsLoadingHighRes(false);
              setImageLoading(false);
              return;
            }
          }

          const response = await fetch(artwork.imageUrl);
          if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setImageSrc(imageUrl);
            setIsLoadingHighRes(false);
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } else {
          // 如果只有缩略图，则完成加载
          setIsLoadingHighRes(false);
        }
      } catch (error) {
        console.error('图片加载失败:', error);
        setImageError(true);
        setIsLoadingHighRes(false);
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
  }, [artwork.id, artwork.image, artwork.imageUrl, artwork.thumbnailLarge, artwork.thumbnailMedium]);

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

        {/* 高清图加载指示器 */}
        {isLoadingHighRes && imageSrc && (
          <div className={styles.highResLoading}>
            <div className={styles.loadingIndicator}>加载高清图...</div>
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
            className={`${styles.artworkImage} ${imageLoading ? styles.hidden : ''} ${isLoadingHighRes ? styles.lowRes : ''}`}
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