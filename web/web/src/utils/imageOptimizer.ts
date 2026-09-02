/**
 * 图片优化工具类
 * 专门用于解决base64图片过大的问题
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
  maxSizeKB?: number; // 最大大小（KB）
}

export interface CompressionResult {
  base64: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dimensions: { width: number; height: number };
}

export class ImageOptimizer {
  /**
   * 智能压缩图片，确保base64大小在合理范围内
   */
  static async smartCompress(
    file: File,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 0.7,
      format = 'jpeg',
      maxSizeKB = 500 // 默认最大500KB
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      let objectUrl: string | null = null;

      const cleanup = () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
      };

      img.onload = async () => {
        try {
          const originalSize = file.size;
          let { width, height } = img;

          // 计算最佳尺寸
          const { width: newWidth, height: newHeight } = this.calculateOptimalDimensions(
            width, height, maxWidth, maxHeight
          );

          canvas.width = newWidth;
          canvas.height = newHeight;

          if (!ctx) {
            cleanup();
            reject(new Error('无法获取canvas上下文'));
            return;
          }

          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // 自适应压缩
          const result = await this.adaptiveCompress(
            canvas, ctx, format, quality, maxSizeKB * 1024
          );

          cleanup();

          const compressedSize = Math.round(result.length * 0.75); // base64编码大约增加33%
          
          resolve({
            base64: result,
            originalSize,
            compressedSize,
            compressionRatio: ((originalSize - compressedSize) / originalSize) * 100,
            dimensions: { width: newWidth, height: newHeight }
          });

        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      img.onerror = () => {
        cleanup();
        reject(new Error('图片加载失败'));
      };

      try {
        objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
      } catch (error) {
        cleanup();
        reject(new Error('创建图片URL失败'));
      }
    });
  }

  /**
   * 计算最佳尺寸
   */
  private static calculateOptimalDimensions(
    width: number, 
    height: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    // 如果图片尺寸在限制范围内，直接返回
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height };
    }

    // 计算缩放比例
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);

    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio)
    };
  }

  /**
   * 自适应压缩算法
   */
  private static async adaptiveCompress(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    format: string,
    initialQuality: number,
    maxBytes: number
  ): Promise<string> {
    let quality = initialQuality;
    let attempts = 0;
    const maxAttempts = 8;

    while (attempts < maxAttempts) {
      const result = await this.compressToBase64(canvas, format, quality);
      const sizeInBytes = Math.round(result.length * 0.75);

      // 如果大小满足要求，返回结果
      if (sizeInBytes <= maxBytes || quality <= 0.1) {
        return result;
      }

      // 根据当前大小与目标大小的比例调整质量
      const sizeRatio = maxBytes / sizeInBytes;
      quality = Math.max(0.1, quality * Math.sqrt(sizeRatio));
      attempts++;
    }

    // 如果质量压缩还是不够，尝试进一步缩小尺寸
    if (canvas.width > 400 || canvas.height > 400) {
      const scaleFactor = 0.8;
      const newWidth = Math.round(canvas.width * scaleFactor);
      const newHeight = Math.round(canvas.height * scaleFactor);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // 重新绘制缩放后的图片
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        tempCtx.putImageData(imageData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
      }

      return this.compressToBase64(canvas, format, Math.max(0.3, quality));
    }

    // 最后的兜底方案
    return this.compressToBase64(canvas, format, 0.1);
  }

  /**
   * 压缩为base64
   */
  private static compressToBase64(
    canvas: HTMLCanvasElement,
    format: string,
    quality: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              resolve(result);
            };
            reader.onerror = () => reject(new Error('文件读取错误'));
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('图片处理失败'));
          }
        },
        format === 'png' ? 'image/png' : `image/${format}`,
        format === 'png' ? undefined : quality
      );
    });
  }

  /**
   * 快速压缩（用于缩略图）
   */
  static async createThumbnail(
    file: File,
    size: number = 150,
    quality: number = 0.6
  ): Promise<string> {
    const result = await this.smartCompress(file, {
      maxWidth: size,
      maxHeight: size,
      quality,
      maxSizeKB: 50 // 缩略图限制50KB
    });
    
    return result.base64;
  }

  /**
   * 批量压缩
   */
  static async batchCompress(
    files: File[],
    options: CompressionOptions = {}
  ): Promise<CompressionResult[]> {
    const results: CompressionResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.smartCompress(file, options);
        results.push(result);
      } catch (error) {
        console.error(`压缩文件 ${file.name} 失败:`, error);
        // 继续处理其他文件
      }
    }
    
    return results;
  }

  /**
   * 获取图片信息
   */
  static async getImageInfo(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('无法读取图片信息'));
      };

      img.src = objectUrl;
    });
  }
} 