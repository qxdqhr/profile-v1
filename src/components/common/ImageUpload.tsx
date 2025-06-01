import React, { useState, useRef } from 'react';
import { Upload, Link, X, Image as ImageIcon } from 'lucide-react';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

// 图片压缩函数
const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height);
      
      // 转换为base64
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('图片压缩失败'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  placeholder = "输入图片URL或上传本地图片",
  label = "图片"
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
      
      // 如果文件较大，进行压缩
      if (file.size > 1024 * 1024) { // 1MB以上的文件进行压缩
        const compressedBase64 = await compressImage(file);
        onChange(compressedBase64);
      } else {
        // 小文件直接转换
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onChange(result);
        };
        reader.readAsDataURL(file);
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
                {compressing ? '正在压缩图片...' : '点击上传或拖拽图片到此处'}
              </p>
              <p className={styles.uploadHint}>
                支持 JPG、PNG、GIF 格式，最大 10MB，大图片将自动压缩
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