import React, { useState, useRef } from 'react';
import { Upload, Link, X, Image as ImageIcon } from 'lucide-react';
import styles from './ImageUpload.module.css';

export interface WatermarkConfig {
  enabled: boolean;
  text?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  opacity?: number;
  fontSize?: number;
  color?: string;
  imageUrl?: string;
}

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  watermark?: WatermarkConfig;
}

// 图片压缩和水印添加函数
const compressImageWithWatermark = (
  file: File, 
  maxWidth: number = 1200, 
  quality: number = 0.8,
  watermarkConfig?: ImageUploadProps['watermark']
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = async () => {
      try {
        // 计算新的尺寸
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制主图片
        ctx?.drawImage(img, 0, 0, width, height);
        
        // 添加水印
        if (watermarkConfig?.enabled && ctx) {
          await addWatermark(ctx, canvas, watermarkConfig);
        }
        
        // 转换为base64
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            } else {
              reject(new Error('图片处理失败'));
            }
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// 添加水印函数
const addWatermark = async (
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  config: NonNullable<ImageUploadProps['watermark']>
): Promise<void> => {
  const { width, height } = canvas;
  
  // 设置透明度
  ctx.globalAlpha = config.opacity || 0.5;
  
  if (config.imageUrl) {
    // 图片水印
    try {
      const watermarkImg = new Image();
      watermarkImg.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        watermarkImg.onload = () => {
          const wmWidth = Math.min(width * 0.2, watermarkImg.width);
          const wmHeight = (watermarkImg.height * wmWidth) / watermarkImg.width;
          
          const position = getWatermarkPosition(config.position || 'bottom-right', width, height, wmWidth, wmHeight);
          ctx.drawImage(watermarkImg, position.x, position.y, wmWidth, wmHeight);
          resolve();
        };
        watermarkImg.onerror = reject;
        watermarkImg.src = config.imageUrl!;
      });
    } catch (error) {
      console.warn('图片水印加载失败，使用文字水印:', error);
      // 如果图片水印失败，使用文字水印
      addTextWatermark(ctx, width, height, config);
    }
  } else if (config.text) {
    // 文字水印
    addTextWatermark(ctx, width, height, config);
  }
  
  // 恢复透明度
  ctx.globalAlpha = 1;
};

// 添加文字水印
const addTextWatermark = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: NonNullable<ImageUploadProps['watermark']>
) => {
  const text = config.text || '© 版权所有';
  const fontSize = config.fontSize || Math.max(width * 0.03, 16);
  const color = config.color || '#ffffff';
  
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = fontSize * 0.1;
  
  // 测量文字尺寸
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;
  
  const position = getWatermarkPosition(config.position || 'bottom-right', width, height, textWidth, textHeight);
  
  // 添加文字描边（提高可读性）
  ctx.strokeText(text, position.x, position.y + textHeight);
  // 添加文字填充
  ctx.fillText(text, position.x, position.y + textHeight);
};

// 获取水印位置
const getWatermarkPosition = (
  position: string,
  canvasWidth: number,
  canvasHeight: number,
  watermarkWidth: number,
  watermarkHeight: number
) => {
  const padding = 20;
  
  switch (position) {
    case 'top-left':
      return { x: padding, y: padding };
    case 'top-right':
      return { x: canvasWidth - watermarkWidth - padding, y: padding };
    case 'bottom-left':
      return { x: padding, y: canvasHeight - watermarkHeight - padding };
    case 'bottom-right':
      return { x: canvasWidth - watermarkWidth - padding, y: canvasHeight - watermarkHeight - padding };
    case 'center':
      return { 
        x: (canvasWidth - watermarkWidth) / 2, 
        y: (canvasHeight - watermarkHeight) / 2 
      };
    default:
      return { x: canvasWidth - watermarkWidth - padding, y: canvasHeight - watermarkHeight - padding };
  }
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  placeholder = "输入图片URL或上传本地图片",
  label = "图片",
  watermark
}) => {
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const [dragOver, setDragOver] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 检查文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('图片文件大小不能超过10MB');
      return;
    }

    try {
      setCompressing(true);
      
      // 如果文件较大，进行压缩，同时添加水印
      if (file.size > 1024 * 1024) { // 1MB以上的文件进行压缩
        const processedBase64 = await compressImageWithWatermark(file, 1200, 0.8, watermark);
        onChange(processedBase64);
      } else {
        // 小文件也要添加水印
        if (watermark?.enabled) {
          const processedBase64 = await compressImageWithWatermark(file, 2400, 0.95, watermark);
          onChange(processedBase64);
        } else {
          // 不需要水印的小文件直接转换
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            onChange(result);
          };
          reader.readAsDataURL(file);
        }
      }
    } catch (error) {
      console.error('图片处理失败:', error);
      alert('图片处理失败，请重试');
    } finally {
      setCompressing(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 清除图片
  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 打开文件选择器
  const handleUploadClick = () => {
    if (!compressing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      
      {/* 模式切换 */}
      <div className={styles.modeToggle}>
        <button
          type="button"
          className={`${styles.modeButton} ${uploadMode === 'url' ? styles.active : ''}`}
          onClick={() => setUploadMode('url')}
        >
          <Link size={16} />
          URL链接
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${uploadMode === 'upload' ? styles.active : ''}`}
          onClick={() => setUploadMode('upload')}
        >
          <Upload size={16} />
          本地上传
        </button>
      </div>

      {/* URL输入模式 */}
      {uploadMode === 'url' && (
        <div className={styles.urlInput}>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={styles.input}
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearButton}
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* 文件上传模式 */}
      {uploadMode === 'upload' && (
        <div
          className={`${styles.uploadArea} ${dragOver ? styles.dragOver : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={styles.hiddenInput}
          />
          
          {value ? (
            <div className={styles.uploadedImage}>
              <img src={value} alt="上传的图片" className={styles.previewImage} />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className={styles.removeButton}
                disabled={compressing}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className={styles.uploadPrompt}>
              <ImageIcon size={48} className={styles.uploadIcon} />
              <p className={styles.uploadText}>
                {compressing ? '正在处理图片...' : '点击上传或拖拽图片到此处'}
              </p>
              <p className={styles.uploadHint}>
                支持 JPG、PNG、GIF 格式，最大 10MB
                {watermark?.enabled && (
                  <>
                    <br />
                    <span className={styles.watermarkHint}>
                      {watermark.imageUrl ? '将添加图片水印' : `将添加文字水印: ${watermark.text || '© 版权所有'}`}
                    </span>
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 图片预览 */}
      {value && uploadMode === 'url' && (
        <div className={styles.preview}>
          <img src={value} alt="图片预览" className={styles.previewImage} />
        </div>
      )}
    </div>
  );
}; 