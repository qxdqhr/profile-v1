import React, { useState, useRef } from 'react';
import { Upload, Link, X, Image as ImageIcon } from 'lucide-react';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  placeholder = "输入图片URL或上传本地图片",
  label = "图片"
}) => {
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片文件大小不能超过5MB');
      return;
    }

    // 转换为base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
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
    fileInputRef.current?.click();
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
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className={styles.uploadPrompt}>
              <ImageIcon size={48} className={styles.uploadIcon} />
              <p className={styles.uploadText}>
                点击上传或拖拽图片到此处
              </p>
              <p className={styles.uploadHint}>
                支持 JPG、PNG、GIF 格式，最大 5MB
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