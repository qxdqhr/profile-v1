import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import { ArtworkPage } from '../types';
import { ImagePreloadService } from '../services/imagePreloadService';
import styles from './ThumbnailSidebar.module.css';

interface ThumbnailSidebarProps {
  pages: ArtworkPage[];
  currentPage: number;
  onPageSelect: (pageIndex: number) => void;
}

interface ThumbnailItemProps {
  page: ArtworkPage;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}

// 🚀 优化后的懒加载缩略图组件
const ThumbnailItem: React.FC<ThumbnailItemProps> = ({ page, index, isActive, onSelect }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  // 使用Intersection Observer实现真正的懒加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`thumbnail-${page.id}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [page.id]);

  // 🚀 优化的图片加载逻辑：优先使用缩略图
  useEffect(() => {
    if (!isVisible) return;

    const loadThumbnail = async () => {
      setImageLoading(true);
      setImageError(false);

      try {
        const preloadService = ImagePreloadService.getInstance();
        
        // 🚀 第一优先级：使用已有的小缩略图数据
        if (page.thumbnailSmall && page.thumbnailSmall.trim() !== '') {
          setImageSrc(page.thumbnailSmall);
          setImageLoading(false);
          return;
        }

        // 🚀 第二优先级：尝试使用缩略图API
        if (page.imageUrl) {
          const thumbnailUrl = page.imageUrl.replace('/image', '/thumbnail?size=small');
          
          // 检查是否已预加载
          if (preloadService.isImagePreloaded(thumbnailUrl)) {
            const preloadedImg = preloadService.getPreloadedImage(thumbnailUrl);
            if (preloadedImg) {
              setImageSrc(preloadedImg.src);
              setImageLoading(false);
              return;
            }
          }

          // 直接加载缩略图
          const response = await fetch(thumbnailUrl);
          if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setImageSrc(imageUrl);
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } else {
          throw new Error('无缩略图数据');
        }
      } catch (error) {
        console.warn('缩略图加载失败，尝试加载原始图片:', error);
        
        // 🚀 降级策略：使用原始图片数据
        if (page.image && page.image.trim() !== '') {
          setImageSrc(page.image);
        } else {
          setImageError(true);
        }
      } finally {
        setImageLoading(false);
      }
    };

    loadThumbnail();

    // 清理函数：释放blob URL
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [isVisible, page.id, page.thumbnailSmall, page.image, page.imageUrl]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <button
      id={`thumbnail-${page.id}`}
      onClick={onSelect}
      className={`${styles.thumbnailItem} ${isActive ? styles.active : ''}`}
      aria-label={`查看第 ${index + 1} 页：${page.title}`}
    >
      <div className={styles.thumbnailImageContainer}>
        {/* 加载状态 */}
        {imageLoading && (
          <div className={styles.thumbnailLoading}>
            <div className={styles.loadingSpinner}></div>
          </div>
        )}

        {/* 错误状态 */}
        {imageError && (
          <div className={styles.thumbnailError}>
            <ImageIcon size={20} />
          </div>
        )}

        {/* 缩略图 */}
        {imageSrc && !imageError && (
          <img
            src={imageSrc}
            alt={page.title}
            className={`${styles.thumbnailImage} ${imageLoading ? styles.hidden : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* 页码指示器 */}
        <div className={styles.pageNumber}>{index + 1}</div>
      </div>
      
      <div className={styles.thumbnailInfo}>
        <h4 className={styles.thumbnailTitle}>{page.title}</h4>
        <p className={styles.thumbnailArtist}>{page.artist}</p>
      </div>
    </button>
  );
};

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  pages,
  currentPage,
  onPageSelect
}) => {
  // 🚀 集成预加载服务
  useEffect(() => {
    const preloadService = ImagePreloadService.getInstance();
    
    // 当页面变化时，触发相邻页面的预加载
    if (pages.length > 0 && currentPage >= 0 && currentPage < pages.length) {
      preloadService.preloadAdjacentArtworks(pages, currentPage, 3)
        .catch(error => console.warn('预加载失败:', error));
    }
  }, [pages, currentPage]);

  return (
    <div className={styles.thumbnailSidebar}>
      <div className={styles.thumbnailHeader}>
        <h3>作品列表</h3>
        <span className={styles.pageIndicator}>
          {currentPage + 1} / {pages.length}
        </span>
      </div>
      
      <div className={styles.thumbnailList}>
        {pages.map((page, index) => (
          <ThumbnailItem
            key={page.id}
            page={page}
            index={index}
            isActive={index === currentPage}
            onSelect={() => onPageSelect(index)}
          />
        ))}
      </div>
    </div>
  );
}; 