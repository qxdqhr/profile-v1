import { ArtworkPage } from '../types';

/**
 * 图片预加载服务
 * 
 * 预加载策略：
 * 1. 缩略图优先加载策略：small -> medium -> large
 * 2. 相邻作品预加载：当前作品+前后各3张作品
 * 3. 智能大小选择：根据设备和网络条件选择最适合的缩略图尺寸
 * 4. 内存管理：自动清理不再需要的预加载图片
 * 5. 错误处理：预加载失败不影响主要功能
 */
export class ImagePreloadService {
  private static instance: ImagePreloadService;
  private preloadedImages = new Map<string, HTMLImageElement>();
  private preloadQueue = new Set<string>();
  private maxCacheSize = 50; // 最大缓存图片数量
  private isPreloadingEnabled = true;

  // 获取单例实例
  static getInstance(): ImagePreloadService {
    if (!ImagePreloadService.instance) {
      ImagePreloadService.instance = new ImagePreloadService();
    }
    return ImagePreloadService.instance;
  }

  /**
   * 获取当前设备推荐的缩略图尺寸
   */
  private getRecommendedThumbnailSize(): 'small' | 'medium' | 'large' {
    // 检查设备像素比
    const pixelRatio = window.devicePixelRatio || 1;
    
    // 检查屏幕尺寸
    const screenWidth = window.innerWidth;
    
    // 检查网络条件（如果支持）
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g' ||
      connection.saveData
    );

    if (isSlowConnection) {
      return 'small';
    }

    if (screenWidth < 768) {
      // 移动设备
      return pixelRatio >= 2 ? 'medium' : 'small';
    } else if (screenWidth < 1200) {
      // 平板设备
      return pixelRatio >= 2 ? 'large' : 'medium';
    } else {
      // 桌面设备
      return 'large';
    }
  }

  /**
   * 构建缩略图URL
   */
  private getThumbnailUrl(artwork: ArtworkPage, size: 'small' | 'medium' | 'large'): string {
    if (artwork.imageUrl) {
      return artwork.imageUrl.replace('/image', `/thumbnail?size=${size}`);
    }
    return '';
  }

  /**
   * 预加载单张图片
   */
  private async preloadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      // 检查是否已经在缓存中
      if (this.preloadedImages.has(url)) {
        resolve(this.preloadedImages.get(url)!);
        return;
      }

      // 检查是否正在预加载
      if (this.preloadQueue.has(url)) {
        // 等待其他预加载完成
        const checkInterval = setInterval(() => {
          if (this.preloadedImages.has(url)) {
            clearInterval(checkInterval);
            resolve(this.preloadedImages.get(url)!);
          } else if (!this.preloadQueue.has(url)) {
            // 预加载失败了
            clearInterval(checkInterval);
            reject(new Error('预加载被取消'));
          }
        }, 50);
        return;
      }

      this.preloadQueue.add(url);

      const img = new Image();
      
      img.onload = () => {
        this.preloadQueue.delete(url);
        this.preloadedImages.set(url, img);
        
        // 检查缓存大小
        this.trimCache();
        
        resolve(img);
      };

      img.onerror = () => {
        this.preloadQueue.delete(url);
        console.warn('图片预加载失败:', url);
        reject(new Error('图片预加载失败'));
      };

      // 设置超时
      setTimeout(() => {
        if (this.preloadQueue.has(url)) {
          this.preloadQueue.delete(url);
          console.warn('图片预加载超时:', url);
          reject(new Error('图片预加载超时'));
        }
      }, 10000); // 10秒超时

      img.src = url;
    });
  }

  /**
   * 预加载作品的多种尺寸缩略图
   */
  async preloadArtworkThumbnails(artwork: ArtworkPage): Promise<void> {
    if (!this.isPreloadingEnabled) return;

    try {
      const recommendedSize = this.getRecommendedThumbnailSize();
      
      // 根据推荐尺寸确定预加载优先级
      const sizes: ('small' | 'medium' | 'large')[] = 
        recommendedSize === 'small' ? ['small', 'medium'] :
        recommendedSize === 'medium' ? ['medium', 'small', 'large'] :
        ['large', 'medium'];

      // 串行预加载，避免同时发起过多请求
      for (const size of sizes) {
        try {
          const url = this.getThumbnailUrl(artwork, size);
          if (url) {
            await this.preloadImage(url);
          }
        } catch (error) {
          // 单个尺寸失败不影响其他尺寸
          console.warn(`预加载${size}缩略图失败:`, error);
        }
      }

    } catch (error) {
      console.warn('预加载作品缩略图失败:', error);
    }
  }

  /**
   * 预加载当前作品周围的作品（智能预加载）
   */
  async preloadAdjacentArtworks(
    artworks: ArtworkPage[],
    currentIndex: number,
    preloadRange: number = 3
  ): Promise<void> {
    if (!this.isPreloadingEnabled || artworks.length === 0) return;

    const startIndex = Math.max(0, currentIndex - preloadRange);
    const endIndex = Math.min(artworks.length - 1, currentIndex + preloadRange);

    // 按距离优先级预加载
    const preloadTasks: Promise<void>[] = [];
    
    for (let i = 0; i <= preloadRange; i++) {
      // 预加载前面的作品
      if (currentIndex - i >= startIndex && currentIndex - i !== currentIndex) {
        preloadTasks.push(this.preloadArtworkThumbnails(artworks[currentIndex - i]));
      }
      
      // 预加载后面的作品
      if (currentIndex + i <= endIndex && currentIndex + i !== currentIndex) {
        preloadTasks.push(this.preloadArtworkThumbnails(artworks[currentIndex + i]));
      }
    }

    // 并行执行预加载任务
    try {
      await Promise.allSettled(preloadTasks);
    } catch (error) {
      console.warn('批量预加载失败:', error);
    }
  }

  /**
   * 获取预加载的图片（如果已缓存）
   */
  getPreloadedImage(url: string): HTMLImageElement | null {
    return this.preloadedImages.get(url) || null;
  }

  /**
   * 检查图片是否已预加载
   */
  isImagePreloaded(url: string): boolean {
    return this.preloadedImages.has(url);
  }

  /**
   * 清理缓存，保持在最大大小限制内
   */
  private trimCache(): void {
    if (this.preloadedImages.size <= this.maxCacheSize) return;

    // 简单的LRU策略：删除最早加载的图片
    const keys = Array.from(this.preloadedImages.keys());
    const deleteCount = this.preloadedImages.size - this.maxCacheSize;
    
    for (let i = 0; i < deleteCount; i++) {
      const key = keys[i];
      const img = this.preloadedImages.get(key);
      if (img) {
        // 清理图片资源
        img.src = '';
      }
      this.preloadedImages.delete(key);
    }
  }

  /**
   * 清空所有预加载缓存
   */
  clearCache(): void {
    this.preloadedImages.forEach(img => {
      img.src = '';
    });
    this.preloadedImages.clear();
    this.preloadQueue.clear();
  }

  /**
   * 启用/禁用预加载
   */
  setPreloadingEnabled(enabled: boolean): void {
    this.isPreloadingEnabled = enabled;
    if (!enabled) {
      this.clearCache();
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    cachedImages: number;
    queuedImages: number;
    maxCacheSize: number;
    isEnabled: boolean;
  } {
    return {
      cachedImages: this.preloadedImages.size,
      queuedImages: this.preloadQueue.size,
      maxCacheSize: this.maxCacheSize,
      isEnabled: this.isPreloadingEnabled,
    };
  }

  /**
   * 设置最大缓存大小
   */
  setMaxCacheSize(size: number): void {
    this.maxCacheSize = Math.max(10, size); // 最小10张
    this.trimCache();
  }
} 