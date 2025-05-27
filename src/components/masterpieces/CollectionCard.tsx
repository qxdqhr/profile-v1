import React, { useState } from 'react';
import { Book, Eye, ImageIcon } from 'lucide-react';
import { ArtCollection } from '@/types/masterpieces';
import styles from './CollectionCard.module.css';

interface CollectionCardProps {
  collection: ArtCollection;
  onSelect: (collection: ArtCollection) => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ 
  collection, 
  onSelect 
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
    <div className={styles.collectionCard}>
      <div className={styles.collectionImageContainer}>
        {/* 图片加载状态 */}
        {imageLoading && (
          <div className={styles.imageLoading}>
            <div className={styles.loadingSpinner}></div>
          </div>
        )}

        {/* 图片错误状态 */}
        {imageError && (
          <div className={styles.imageError}>
            <ImageIcon size={32} />
            <span>图片加载失败</span>
          </div>
        )}

        {/* 封面图片 */}
        <img
          src={collection.coverImage}
          alt={collection.title}
          className={`${styles.collectionCover} ${imageLoading ? styles.hidden : ''} ${imageError ? styles.hidden : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        <div className={styles.collectionOverlay} />
        <div className={styles.collectionBadge}>
          <div className={styles.collectionBadgeContent}>
            <Book size={16} />
            <span className={styles.collectionBadgeText}>
              共 {collection.pages.length} 页
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.collectionContent}>
        <h3 className={styles.collectionTitle}>{collection.title}</h3>
        <p className={styles.collectionArtist}>作者：{collection.artist}</p>
        {collection.category && (
          <p className={styles.collectionCategory}>分类：{collection.category}</p>
        )}
        <p className={styles.collectionDescription}>{collection.description}</p>
        
        <button
          onClick={() => onSelect(collection)}
          className={styles.collectionButton}
        >
          <Eye size={18} />
          开始浏览
        </button>
      </div>
    </div>
  );
}; 