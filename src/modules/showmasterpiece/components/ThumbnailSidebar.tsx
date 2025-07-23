import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import { ArtworkPage } from '../types';
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

// 🚀 懒加载缩略图组件
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

  // 当组件可见时才加载图片
  useEffect(() => {
    if (!isVisible) return;

    const loadThumbnail = async () => {
      setImageLoading(true);
      setImageError(false);

      try {
        // 如果已有图片数据，直接使用
        if (page.image && page.image.trim() !== '') {
          setImageSrc(page.image);
          setImageLoading(false);
          return;
        }

        // 否则直接使用image
        if (page.image) {
          setImageSrc(page.image);
        } else {
          throw new Error('无图片数据');
        }
      } catch (error) {
        console.error('缩略图加载失败:', error);
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    loadThumbnail();

    // 清理函数 - 不再需要清理blob URL
    return () => {
      // 不再使用blob URL，无需清理
    };
  }, [isVisible, page.id, page.image]);

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
      </div>
      
      {/* 隐藏作品名称和作者信息，只显示缩略图 */}
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