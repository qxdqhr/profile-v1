import React, { useState, useRef, useEffect } from 'react';
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
  const [shouldLoadImage, setShouldLoadImage] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 懒加载逻辑
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadImage(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.1 
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className={styles.collectionCard} ref={cardRef}>
      <div className={styles.collectionImageContainer}>
        {/* 图片加载状态 */}
        {imageLoading && shouldLoadImage && (
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

        {/* 封面图片 - 懒加载 */}
        {shouldLoadImage && (
          <img
            src={collection.coverImage}
            alt={collection.title}
            className={`${styles.collectionCover} ${imageLoading ? styles.hidden : ''} ${imageError ? styles.hidden : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
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