import React, { useState } from 'react';
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

const ThumbnailItem: React.FC<ThumbnailItemProps> = ({ page, index, isActive, onSelect }) => {
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
    <button
      onClick={onSelect}
      className={`${styles.thumbnailItem} ${isActive ? styles.active : ''}`}
    >
      <div className={styles.thumbnailContent}>
        <div className={styles.thumbnailImageContainer}>
          {/* 图片加载状态 */}
          {imageLoading && (
            <div className={styles.imageLoading}>
              <div className={styles.loadingSpinner}></div>
            </div>
          )}

          {/* 图片错误状态 */}
          {imageError && (
            <div className={styles.imageError}>
              <ImageIcon size={16} />
            </div>
          )}

          {/* 缩略图 */}
          <img
            src={page.image}
            alt={page.title}
            className={`${styles.thumbnailImage} ${imageLoading ? styles.hidden : ''} ${imageError ? styles.hidden : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
        
        <div className={styles.thumbnailInfo}>
          <div className={styles.thumbnailTitle}>
            {page.title}
          </div>
          <div className={styles.thumbnailPage}>
            第 {index + 1} 页
          </div>
        </div>
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
    <div className={styles.sidebarCard}>
      <h3 className={styles.sidebarTitle}>画集目录</h3>
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