import React, { useState, useRef } from 'react';
import { Link, Upload, X, ImageIcon, AlertTriangle } from 'lucide-react';
import { ImageOptimizer, type CompressionResult } from '@/utils/imageOptimizer';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

// 文件预检查函数
const preCheckImage = (file: File): { valid: boolean; warning?: string; error?: string } => {
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: '请选择图片文件（JPG、PNG、GIF等格式）' };
  }

  // 检查文件大小
  if (file.size > 20 * 1024 * 1024) { // 20MB硬限制
    return { valid: false, error: '图片文件过大，请选择小于20MB的图片' };
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB警告
    return { 
      valid: true, 
      warning: '图片文件较大，将进行智能压缩处理，请稍候...' 
    };
  }

  return { valid: true };
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
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    // 清除之前的状态
    setWarning(null);
    setError(null);
    setCompressionInfo(null);

    // 预检查文件
    const checkResult = preCheckImage(file);
    if (!checkResult.valid) {
      setError(checkResult.error || '文件无效');
      return;
    }

    if (checkResult.warning) {
      setWarning(checkResult.warning);
    }

    try {
      setCompressing(true);
      
      // 根据文件大小选择不同的压缩策略
      let maxSizeKB = 800; // 默认800KB
      let maxWidth = 1000;
      let quality = 0.8;
      
      if (file.size > 5 * 1024 * 1024) { // 5MB以上
        maxSizeKB = 500;
        maxWidth = 800;
        quality = 0.7;
      } else if (file.size > 2 * 1024 * 1024) { // 2MB以上
        maxSizeKB = 600;
        maxWidth = 900;
        quality = 0.75;
      } else if (file.size > 1024 * 1024) { // 1MB以上
        maxSizeKB = 700;
        maxWidth = 1000;
        quality = 0.8;
      }

      const result = await ImageOptimizer.smartCompress(file, {
        maxWidth,
        maxHeight: maxWidth,
        quality,
        maxSizeKB,
        format: 'jpeg'
      });

      setCompressionInfo(result);
      onChange(result.base64);
      setWarning(null);
      
      // 检查最终大小，如果仍然很大则提醒
      if (result.compressedSize > 2 * 1024 * 1024) { // 2MB
        setWarning('压缩后图片仍较大，上传可能需要更长时间');
      }
      
    } catch (error) {
      console.error('图片处理失败:', error);
      setError(error instanceof Error ? error.message : '图片处理失败，请重试');
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
    setCompressionInfo(null);
    setWarning(null);
    setError(null);
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

      {/* 错误提示 */}
      {error && (
        <div className={styles.errorMessage}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 警告提示 */}
      {warning && (
        <div className={styles.warningMessage}>
          <AlertTriangle size={16} />
          <span>{warning}</span>
        </div>
      )}

      {/* URL输入模式 */}
      {uploadMode === 'url' && (
        <div className={styles.urlInput}>
          <input
            type="url"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setError(null);
              setWarning(null);
            }}
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
          className={`${styles.uploadArea} ${dragOver ? styles.dragOver : ''} ${compressing ? styles.processing : ''}`}
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
            disabled={compressing}
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
                {compressing ? '正在智能压缩图片...' : '点击上传或拖拽图片到此处'}
              </p>
              <p className={styles.uploadHint}>
                支持 JPG、PNG、GIF 格式，推荐小于5MB
                <br />
                <small>自动智能压缩，减少存储空间</small>
              </p>
            </div>
          )}
        </div>
      )}

      {/* 压缩信息显示 */}
      {compressionInfo && (
        <div className={styles.compressionInfo}>
          <h4 className={styles.compressionTitle}>📊 压缩信息</h4>
          <div className={styles.compressionDetails}>
            <div className={styles.compressionItem}>
              <span>原始大小:</span>
              <span>{(compressionInfo.originalSize / 1024).toFixed(1)} KB</span>
            </div>
            <div className={styles.compressionItem}>
              <span>压缩后:</span>
              <span>{(compressionInfo.compressedSize / 1024).toFixed(1)} KB</span>
            </div>
            <div className={styles.compressionItem}>
              <span>压缩率:</span>
              <span className={styles.compressionRatio}>
                {compressionInfo.compressionRatio.toFixed(1)}%
              </span>
            </div>
            <div className={styles.compressionItem}>
              <span>尺寸:</span>
              <span>
                {compressionInfo.dimensions.width} × {compressionInfo.dimensions.height}
              </span>
            </div>
          </div>
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