import sharp from 'sharp';

export interface ImageProcessingResult {
  originalImage: string;
  thumbnailSmall: string;
  thumbnailMedium: string;
  thumbnailLarge: string;
  imageWidth: number;
  imageHeight: number;
  fileSize: number;
}

export interface ThumbnailConfig {
  width: number;
  height: number;
  quality: number;
  format: 'jpeg' | 'webp' | 'png';
}

// 缩略图配置
const THUMBNAIL_CONFIGS = {
  small: { width: 150, height: 150, quality: 80, format: 'jpeg' as const },
  medium: { width: 300, height: 300, quality: 85, format: 'jpeg' as const },
  large: { width: 600, height: 600, quality: 90, format: 'jpeg' as const },
} as const;

/**
 * 图片处理服务类
 * 提供图片压缩、缩略图生成、格式转换等功能
 */
export class ImageProcessingService {
  /**
   * 处理图片：生成压缩版本和多种规格的缩略图
   */
  static async processImage(imageInput: string | Buffer): Promise<ImageProcessingResult> {
    try {
      let imageBuffer: Buffer;
      
      // 处理不同的输入格式
      if (typeof imageInput === 'string') {
        if (imageInput.startsWith('data:')) {
          // Base64 图片
          const base64Data = imageInput.split(',')[1];
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else if (imageInput.startsWith('http')) {
          // URL 图片
          const response = await fetch(imageInput);
          if (!response.ok) {
            throw new Error(`无法获取图片: ${response.status}`);
          }
          imageBuffer = Buffer.from(await response.arrayBuffer());
        } else {
          throw new Error('不支持的图片格式');
        }
      } else {
        imageBuffer = imageInput;
      }

      // 获取原始图片信息
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      
      if (!metadata.width || !metadata.height) {
        throw new Error('无法获取图片尺寸');
      }

      // 生成压缩的原始图片
      const compressedImage = await image
        .jpeg({ quality: 95, progressive: true })
        .toBuffer();

      // 并行生成缩略图
      const [thumbnailSmall, thumbnailMedium, thumbnailLarge] = await Promise.all([
        this.generateThumbnail(image, THUMBNAIL_CONFIGS.small),
        this.generateThumbnail(image, THUMBNAIL_CONFIGS.medium),
        this.generateThumbnail(image, THUMBNAIL_CONFIGS.large),
      ]);

      return {
        originalImage: `data:image/jpeg;base64,${compressedImage.toString('base64')}`,
        thumbnailSmall: `data:image/jpeg;base64,${thumbnailSmall.toString('base64')}`,
        thumbnailMedium: `data:image/jpeg;base64,${thumbnailMedium.toString('base64')}`,
        thumbnailLarge: `data:image/jpeg;base64,${thumbnailLarge.toString('base64')}`,
        imageWidth: metadata.width,
        imageHeight: metadata.height,
        fileSize: compressedImage.length,
      };

    } catch (error) {
      console.error('图片处理失败:', error);
      throw new Error(`图片处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 生成指定规格的缩略图
   */
  private static async generateThumbnail(
    image: sharp.Sharp,
    config: ThumbnailConfig
  ): Promise<Buffer> {
    return await image
      .clone()
      .resize(config.width, config.height, {
        fit: 'cover', // 裁剪适应
        position: 'center', // 居中裁剪
      })
      .jpeg({ 
        quality: config.quality,
        progressive: true,
        // mozjpeg: true // 使用mozjpeg编码器获得更好的压缩 - 注释掉，sharp可能不支持此选项
      })
      .toBuffer();
  }

  /**
   * 仅生成缩略图（用于现有图片补充缩略图）
   */
  static async generateThumbnailsOnly(imageInput: string | Buffer): Promise<{
    thumbnailSmall: string;
    thumbnailMedium: string;
    thumbnailLarge: string;
  }> {
    try {
      let imageBuffer: Buffer;
      
      if (typeof imageInput === 'string') {
        if (imageInput.startsWith('data:')) {
          const base64Data = imageInput.split(',')[1];
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else if (imageInput.startsWith('http')) {
          const response = await fetch(imageInput);
          if (!response.ok) {
            throw new Error(`无法获取图片: ${response.status}`);
          }
          imageBuffer = Buffer.from(await response.arrayBuffer());
        } else {
          throw new Error('不支持的图片格式');
        }
      } else {
        imageBuffer = imageInput;
      }

      const image = sharp(imageBuffer);

      const [thumbnailSmall, thumbnailMedium, thumbnailLarge] = await Promise.all([
        this.generateThumbnail(image, THUMBNAIL_CONFIGS.small),
        this.generateThumbnail(image, THUMBNAIL_CONFIGS.medium),
        this.generateThumbnail(image, THUMBNAIL_CONFIGS.large),
      ]);

      return {
        thumbnailSmall: `data:image/jpeg;base64,${thumbnailSmall.toString('base64')}`,
        thumbnailMedium: `data:image/jpeg;base64,${thumbnailMedium.toString('base64')}`,
        thumbnailLarge: `data:image/jpeg;base64,${thumbnailLarge.toString('base64')}`,
      };

    } catch (error) {
      console.error('缩略图生成失败:', error);
      throw new Error(`缩略图生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取图片信息（不进行处理）
   */
  static async getImageInfo(imageInput: string | Buffer): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
  }> {
    try {
      let imageBuffer: Buffer;
      
      if (typeof imageInput === 'string') {
        if (imageInput.startsWith('data:')) {
          const base64Data = imageInput.split(',')[1];
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else if (imageInput.startsWith('http')) {
          const response = await fetch(imageInput);
          if (!response.ok) {
            throw new Error(`无法获取图片: ${response.status}`);
          }
          imageBuffer = Buffer.from(await response.arrayBuffer());
        } else {
          throw new Error('不支持的图片格式');
        }
      } else {
        imageBuffer = imageInput;
      }

      const metadata = await sharp(imageBuffer).metadata();
      
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: imageBuffer.length,
      };

    } catch (error) {
      console.error('获取图片信息失败:', error);
      throw new Error(`获取图片信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检查图片是否需要处理
   */
  static shouldProcessImage(
    fileSize: number,
    width?: number,
    height?: number
  ): boolean {
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const MAX_DIMENSION = 2000; // 2000px

    return (
      fileSize > MAX_FILE_SIZE ||
      (width !== undefined && width > MAX_DIMENSION) ||
      (height !== undefined && height > MAX_DIMENSION)
    );
  }
} 