import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { ArtworkPage } from '../types';

interface ArtworkViewerProps {
  artwork: ArtworkPage;
  collectionId: number; // 添加collectionId
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export const ArtworkViewer: React.FC<ArtworkViewerProps> = ({
  artwork,
  collectionId,
  onNext,
  onPrev,
  canGoNext,
  canGoPrev
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  // 🚀 图片加载逻辑 - 优先使用imageUrl，不再支持Base64
  useEffect(() => {
    const loadImage = async () => {
      setImageLoading(true);
      setImageError(false);
      
      try {
        // 优先使用image（通过通用文件服务或API获取）
        if (artwork.image) {
          // 直接使用image，不再需要转换为blob
          setImageSrc(artwork.image);
          setImageLoading(false);
          return;
        }
        
        // 如果没有imageUrl，尝试使用fileId构建URL
        if (artwork.fileId) {
          const imageUrl = `/api/masterpieces/collections/${collectionId}/artworks/${artwork.id}/image`;
          setImageSrc(imageUrl);
          setImageLoading(false);
          return;
        }
        
        throw new Error('无图片数据');
      } catch (error) {
        console.error('图片加载失败:', error);
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    loadImage();
  }, [artwork.id, artwork.image, artwork.fileId]); // 当作品ID或图片URL变化时重新加载

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
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-full box-border mx-auto lg:p-5 md:p-4 sm:p-3 sm:rounded-xl">
      <div className="relative min-h-[600px] flex items-center justify-center bg-slate-50 rounded-lg overflow-hidden lg:min-h-[500px] md:min-h-[450px] sm:min-h-[350px] sm:rounded-md">
        {/* 图片加载状态 */}
        {imageLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-4 text-gray-500 text-center p-4">
            <div className="w-10 h-10 border-[3px] border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p>加载中...</p>
          </div>
        )}

        {/* 图片错误状态 */}
        {imageError && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-4 text-gray-500 text-center p-4">
            <ImageIcon size={48} />
            <p>图片加载失败</p>
            <button 
              onClick={retryImageLoad}
              className="px-4 py-2 bg-blue-500 text-white border-none rounded-md cursor-pointer text-sm transition-colors duration-200 min-h-[44px] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:min-h-12 sm:px-5 sm:py-3"
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
            className={`w-full h-[600px] object-contain rounded-lg bg-slate-50 transition-opacity duration-300 select-none lg:h-[500px] md:h-[450px] sm:h-[350px] sm:rounded-md ${imageLoading ? 'opacity-0 absolute' : ''}`}
            style={{ WebkitUserDrag: 'none', touchAction: 'pinch-zoom' } as React.CSSProperties}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        {/* 翻页按钮 */}
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/95 border-none rounded-full p-3 shadow-lg cursor-pointer transition-all duration-200 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center backdrop-blur-sm hover:bg-white hover:scale-105 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-white/60 disabled:hover:transform disabled:hover:-translate-y-1/2 disabled:hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:left-3 sm:left-2 sm:min-w-12 sm:min-h-12 sm:p-2"
          aria-label="上一张"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/95 border-none rounded-full p-3 shadow-lg cursor-pointer transition-all duration-200 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center backdrop-blur-sm hover:bg-white hover:scale-105 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-white/60 disabled:hover:transform disabled:hover:-translate-y-1/2 disabled:hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:right-3 sm:right-2 sm:min-w-12 sm:min-h-12 sm:p-2"
          aria-label="下一张"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* 作品信息 */}
      <div className="mt-6 w-full max-w-full box-border lg:mt-5 md:mt-5 sm:mt-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 leading-tight lg:text-xl md:text-xl sm:text-lg sm:leading-5">{artwork.title}</h2>
        <p className="text-lg text-slate-500 mb-2 leading-normal lg:text-base md:text-base sm:text-base">编号：{artwork.number}</p>
        {artwork.createdTime && (
          <p className="text-base text-slate-500 mb-2 sm:text-sm">创作时间：{artwork.createdTime}</p>
        )}
        {artwork.theme && (
          <p className="text-base text-slate-500 mb-2 sm:text-sm">主题：{artwork.theme}</p>
        )}
        {artwork.description && (
          <p className="text-base text-gray-700 mt-4 leading-relaxed sm:text-sm sm:leading-6">{artwork.description}</p>
        )}
      </div>
    </div>
  );
}; 