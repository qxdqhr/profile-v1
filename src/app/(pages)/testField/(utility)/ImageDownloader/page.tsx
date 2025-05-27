'use client';

import { useState } from 'react';
import { BackButton } from '@/app/_components/BackButton';
import styles from './imageDownloader.module.css';

export default function ImageDownloader() {
  const [imageUrl, setImageUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [preview, setPreview] = useState('');
  const [fileName, setFileName] = useState('');

  const handlePreview = () => {
    if (imageUrl.trim()) {
      setPreview(imageUrl);
      // 从URL中提取文件名
      const urlParts = imageUrl.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const nameWithoutQuery = lastPart.split('?')[0];
      setFileName(nameWithoutQuery || 'image');
    }
  };

  const downloadImage = async () => {
    if (!imageUrl.trim()) {
      alert('请输入图片URL');
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('图片下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // 设置下载文件名
      const fileExtension = blob.type.split('/')[1] || 'jpg';
      const downloadFileName = fileName.includes('.') ? fileName : `${fileName}.${fileExtension}`;
      link.download = downloadFileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('图片下载成功！');
    } catch (error) {
      console.error('下载错误:', error);
      alert('图片下载失败，请检查URL是否正确');
    } finally {
      setIsDownloading(false);
    }
  };

  const clearForm = () => {
    setImageUrl('');
    setFileName('');
    setPreview('');
  };

  return (
    <div className={styles.container}>
      <BackButton href="/testField" />
      
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>
            📥 图片下载器
          </h1>
          <p className={styles.subtitle}>
            通过图片URL快速下载图片到本地
          </p>
          
          <div className={styles.form}>
            {/* URL输入区域 */}
            <div className={styles.inputGroup}>
              <label htmlFor="imageUrl" className={styles.label}>
                图片URL
              </label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="请输入图片的完整URL地址..."
                className={styles.input}
              />
            </div>

            {/* 文件名输入区域 */}
            <div className={styles.inputGroup}>
              <label htmlFor="fileName" className={styles.label}>
                文件名 <span className={styles.optional}>(可选)</span>
              </label>
              <input
                type="text"
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="自定义文件名..."
                className={styles.input}
              />
            </div>

            {/* 按钮区域 */}
            <div className={styles.buttonGroup}>
              <button
                onClick={handlePreview}
                className={`${styles.button} ${styles.previewButton}`}
                disabled={!imageUrl.trim()}
              >
                👀 预览图片
              </button>
              
              <button
                onClick={downloadImage}
                disabled={!imageUrl.trim() || isDownloading}
                className={`${styles.button} ${styles.downloadButton}`}
              >
                {isDownloading ? '⏳ 下载中...' : '⬇️ 下载图片'}
              </button>

              <button
                onClick={clearForm}
                className={`${styles.button} ${styles.clearButton}`}
              >
                🗑️ 清空表单
              </button>
            </div>

            {/* 图片预览区域 */}
            {preview && (
              <div className={styles.previewSection}>
                <h3 className={styles.previewTitle}>图片预览</h3>
                <div className={styles.previewContainer}>
                  <img
                    src={preview}
                    alt="图片预览"
                    className={styles.previewImage}
                    onError={() => {
                      alert('图片加载失败，请检查URL是否正确');
                      setPreview('');
                    }}
                  />
                </div>
              </div>
            )}

            {/* 使用说明 */}
            <div className={styles.helpSection}>
              <h3 className={styles.helpTitle}>💡 使用说明</h3>
              <ul className={styles.helpList}>
                <li>在URL输入框中粘贴图片的完整网址</li>
                <li>可以自定义下载的文件名（可选）</li>
                <li>点击"预览图片"查看图片效果</li>
                <li>点击"下载图片"将图片保存到本地</li>
                <li>支持常见的图片格式：JPG、PNG、GIF、WebP等</li>
                <li>如果遇到跨域问题，可能需要使用代理服务</li>
              </ul>
            </div>

            {/* 功能特性 */}
            <div className={styles.featureSection}>
              <h3 className={styles.featureTitle}>✨ 功能特性</h3>
              <div className={styles.featureGrid}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🚀</div>
                  <div className={styles.featureText}>
                    <strong>快速下载</strong>
                    <p>支持各种图片格式的快速下载</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🎨</div>
                  <div className={styles.featureText}>
                    <strong>实时预览</strong>
                    <p>下载前可预览图片内容</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>📝</div>
                  <div className={styles.featureText}>
                    <strong>自定义命名</strong>
                    <p>可自定义下载文件的名称</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🔒</div>
                  <div className={styles.featureText}>
                    <strong>安全可靠</strong>
                    <p>本地处理，保护您的隐私</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 