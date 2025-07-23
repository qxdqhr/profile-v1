/**
 * 画集卡片组件 (CollectionCard) - Tailwind CSS 版本
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
 * - Tailwind CSS 样式
 * 
 * @component
 */

import React, { useState, useRef, useEffect } from 'react';
import { Book, Eye, ImageIcon, ShoppingBag } from 'lucide-react';
import { ArtCollection, CollectionCategory } from '../types';
import { AddToCartButton } from './AddToCartButton';

/**
 * CollectionCard 组件的 Props 接口
 */
interface CollectionCardProps {
  /** 要展示的画集数据 */
  collection: ArtCollection;
  /** 用户ID */
  userId: number;
  /** 用户选择画集时的回调函数 */
  onSelect: (collection: ArtCollection) => void;
}

/**
 * 画集卡片组件主体
 * 
 * @param props - 组件属性
 * @param props.collection - 画集数据对象
 * @param props.userId - 用户ID
 * @param props.onSelect - 选择画集的回调函数
 * @returns React函数组件
 */
export const CollectionCard: React.FC<CollectionCardProps> = ({ 
  collection, 
  userId,
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

  // ===== 图片处理函数 =====
  
  /**
   * 图片加载成功处理函数
   * 隐藏加载状态，显示图片
   */
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  /**
   * 图片加载失败处理函数
   * 隐藏加载状态，显示错误状态
   */
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // ===== 渲染函数 =====
  
  /**
   * 渲染图片加载状态
   */
  const renderImageLoading = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  /**
   * 渲染图片错误状态
   */
  const renderImageError = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 text-sm text-center p-4">
      <ImageIcon size={32} className="text-slate-400" />
      <span>图片加载失败</span>
    </div>
  );

  /**
   * 渲染画集封面图片
   */
  const renderCoverImage = () => {
    if (!shouldLoadImage) {
      return renderImageLoading();
    }

    if (imageError) {
      return renderImageError();
    }

    return (
      <img
        src={collection.coverImage}
        alt={collection.title}
        className={`w-full h-64 object-cover transition-opacity duration-300 ${
          imageLoading ? 'opacity-0 absolute' : 'opacity-100'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    );
  };

  /**
   * 格式化价格显示
   */
  const formatPrice = (price?: number): string => {
    if (price === undefined || price === null) {
      return '价格待定';
    }
    if (price === 0) {
      return '免费';
    }
    return `¥${price}`;
  };

  /**
   * 判断是否为商品类型
   */
  const isProduct = collection.category === CollectionCategory.PRODUCT;

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform w-full max-w-sm mx-auto group ${
        isProduct 
          ? 'cursor-default' 
          : 'cursor-pointer hover:-translate-y-2 hover:shadow-3xl'
      }`}
      onClick={isProduct ? undefined : () => onSelect(collection)}
    >
      {/* 图片容器 */}
      <div className="relative h-64 bg-slate-50 flex items-center justify-center overflow-hidden">
        {/* 图片覆盖层 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* 画集徽章 */}
        <div className="absolute bottom-4 left-4 text-white z-10">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
            {isProduct ? (
              <>
                <ShoppingBag size={16} />
                <span className="text-sm font-medium">商品</span>
              </>
            ) : (
              <>
                <Book size={16} />
                <span className="text-sm font-medium">
                  {collection.pages.length} 页
                </span>
              </>
            )}
          </div>
        </div>

        {/* 封面图片 */}
        {renderCoverImage()}
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {/* 标题 */}
        <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {collection.title}
        </h3>
        
        {/* 作者 */}
        <p className="text-slate-600 text-sm mb-1">
          作者：{collection.artist}
        </p>
        
        {/* 分类 */}
        {collection.category && (
          <p className="text-slate-600 text-sm mb-1">
            分类：{collection.category}
          </p>
        )}
        
        {/* 价格 */}
        <p className="text-slate-600 text-sm mb-2">
          价格：{formatPrice(collection.price)}
        </p>
        
        {/* 描述 */}
        {collection.description && (
          <p className="text-slate-500 text-sm mb-4 line-clamp-2">
            {collection.description}
          </p>
        )}
        
        {/* 操作按钮 */}
        <div className="flex gap-2">
          {/* 查看按钮 - 只在画集类型时显示 */}
          {!isProduct && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex-1 justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(collection);
              }}
            >
              <Eye size={16} />
              查看画集
            </button>
          )}
          
          {/* 加入购物车按钮 - 商品类型时占满宽度 */}
          <AddToCartButton
            collection={collection}
            userId={userId}
            className={isProduct ? "w-full" : "flex-1"}
            size="md"
          />
        </div>
      </div>
    </div>
  );
}; 