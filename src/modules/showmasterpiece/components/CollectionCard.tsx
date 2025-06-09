/**
 * 画集卡片组件 (CollectionCard)
 * 
 * 这是一个用于展示单个画集信息的卡片组件，主要用于画集列表页面。
 * 
 * 主要功能：
 * - 画集封面图片展示（支持懒加载）
 * - 画集基本信息显示（标题、作者、分类、描述等）
 * - 作品页数统计显示
 * - 点击进入画集浏览
 * 
 * 性能优化特性：
 * - 图片懒加载（Intersection Observer API）
 * - 加载状态和错误处理
 * - CSS Modules样式隔离
 * 
 * @component
 */

import React, { useState, useRef, useEffect } from 'react';
import { Book, Eye, ImageIcon } from 'lucide-react';
import { ArtCollection } from '../types';
import styles from './CollectionCard.module.css';

/**
 * CollectionCard 组件的 Props 接口
 */
interface CollectionCardProps {
  /** 要展示的画集数据 */
  collection: ArtCollection;
  /** 用户选择画集时的回调函数 */
  onSelect: (collection: ArtCollection) => void;
}

/**
 * 画集卡片组件主体
 * 
 * @param props - 组件属性
 * @param props.collection - 画集数据对象
 * @param props.onSelect - 选择画集的回调函数
 * @returns React函数组件
 */
export const CollectionCard: React.FC<CollectionCardProps> = ({ 
  collection, 
  onSelect 
}) => {
  // ===== 状态管理 =====
  
  /** 图片是否正在加载 */
  const [imageLoading, setImageLoading] = useState(true);
  
  /** 图片是否加载失败 */
  const [imageError, setImageError] = useState(false);
  
  /** 是否应该开始加载图片（懒加载控制） */
  const [shouldLoadImage, setShouldLoadImage] = useState(false);
  
  /** 卡片DOM元素的引用，用于懒加载观察 */
  const cardRef = useRef<HTMLDivElement>(null);

  // ===== 懒加载逻辑 =====
  
  /**
   * 使用 Intersection Observer API 实现图片懒加载
   * 当卡片进入视口时开始加载图片，提升页面性能
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 卡片进入视口，开始加载图片
            setShouldLoadImage(true);
            // 停止观察，避免重复触发
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        rootMargin: '50px', // 提前50px开始加载，提升用户体验
        threshold: 0.1      // 10%的卡片可见时触发
      }
    );

    // 开始观察卡片元素
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    // 清理函数：组件卸载时停止观察
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // ===== 图片加载事件处理 =====
  
  /**
   * 图片成功加载的处理函数
   * 隐藏加载状态，清除错误状态
   */
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  /**
   * 图片加载失败的处理函数
   * 隐藏加载状态，显示错误状态
   */
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // ===== 组件渲染 =====
  
  return (
    <div className={styles.collectionCard} ref={cardRef}>
      {/* 图片容器区域 */}
      <div className={styles.collectionImageContainer}>
        
        {/* 图片加载中的状态显示 */}
        {imageLoading && shouldLoadImage && (
          <div className={styles.imageLoading}>
            <div className={styles.loadingSpinner}></div>
          </div>
        )}

        {/* 图片加载失败的状态显示 */}
        {imageError && (
          <div className={styles.imageError}>
            <ImageIcon size={32} />
            <span>图片加载失败</span>
          </div>
        )}

        {/* 封面图片 - 懒加载实现 */}
        {shouldLoadImage && (
          <img
            src={collection.coverImage}
            alt={collection.title}
            className={`${styles.collectionCover} ${imageLoading ? styles.hidden : ''} ${imageError ? styles.hidden : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy" // 浏览器原生懒加载作为备用
          />
        )}
        
        {/* 图片上的渐变遮罩层，提升文字可读性 */}
        <div className={styles.collectionOverlay} />
        
        {/* 作品页数徽章 */}
        <div className={styles.collectionBadge}>
          <div className={styles.collectionBadgeContent}>
            <Book size={16} />
            <span className={styles.collectionBadgeText}>
              共 {collection.pages.length} 页
            </span>
          </div>
        </div>
      </div>
      
      {/* 画集信息内容区域 */}
      <div className={styles.collectionContent}>
        {/* 画集标题 */}
        <h3 className={styles.collectionTitle}>{collection.title}</h3>
        
        {/* 作者信息 */}
        <p className={styles.collectionArtist}>作者：{collection.artist}</p>
        
        {/* 分类信息（可选） */}
        {collection.category && (
          <p className={styles.collectionCategory}>分类：{collection.category}</p>
        )}
        
        {/* 画集描述 */}
        <p className={styles.collectionDescription}>{collection.description}</p>
        
        {/* 浏览按钮 */}
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