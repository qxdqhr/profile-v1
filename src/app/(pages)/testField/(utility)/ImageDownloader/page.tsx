'use client';

import { useState, useRef } from 'react';
import { BackButton } from 'sa2kit';
import styles from './imageDownloader.module.css';

export default function ImageDownloader() {
  const [imageUrl, setImageUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [preview, setPreview] = useState('');
  const [fileName, setFileName] = useState('');
  const [processedImage, setProcessedImage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'original' | 'processed'>('original');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePreview = () => {
    if (imageUrl.trim()) {
      setPreview(imageUrl);
      // 从URL中提取文件名
      const urlParts = imageUrl.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const nameWithoutQuery = lastPart.split('?')[0];
      setFileName(nameWithoutQuery || 'image');
    } else {
      alert('请选择本地图片或输入图片URL');
    }
  };

  const downloadImage = async () => {
    if (!imageUrl.trim() && !preview) {
      alert('请输入图片URL或上传本地图片');
      return;
    }

    setIsDownloading(true);
    
    try {
      let url: string;
      
      // 如果是本地上传的图片，直接使用preview
      if (preview && !imageUrl.trim()) {
        url = preview;
      } else {
        // 处理网络图片
        const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`, {
          method: 'GET',
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('图片不存在或URL无效');
          } else if (response.status === 403) {
            throw new Error('访问被拒绝，图片可能有防盗链保护');
          } else {
            throw new Error(`下载失败 (${response.status})`);
          }
        }

        const blob = await response.blob();
        url = window.URL.createObjectURL(blob);
      }
      
      const link = document.createElement('a');
      link.href = url;
      
      // 设置下载文件名
      const fileExtension = url.startsWith('data:') ? 
        (preview?.includes('data:image/png') ? 'png' : 'jpg') : 
        'jpg';
      const downloadFileName = fileName.includes('.') ? fileName : `${fileName || 'image'}.${fileExtension}`;
      link.download = downloadFileName;
      
      // 安全的DOM操作
      try {
        document.body.appendChild(link);
        link.click();
        
        // 安全地移除元素
        if (link.parentNode === document.body) {
          document.body.removeChild(link);
        }
      } catch (domError) {
        console.warn('DOM操作警告:', domError);
      }
      
      // 清理URL对象
      if (url.startsWith('blob:')) {
        window.URL.revokeObjectURL(url);
      }
      
      alert('图片下载成功！');
    } catch (error) {
      console.error('下载错误:', error);
      
      // 如果所有方法都失败，提供替代方案
      const fallbackMessage = `
图片下载失败，这可能是由于跨域限制造成的。

请尝试以下替代方案：
1. 右键点击预览图片 → "图片另存为"
2. 复制图片链接到新标签页，然后右键保存
3. 使用本地图片上传功能避免跨域问题

图片链接: ${imageUrl}
      `;
      
      if (confirm(fallbackMessage + '\n\n是否在新标签页中打开图片？')) {
        window.open(imageUrl, '_blank');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const clearForm = () => {
    setImageUrl('');
    setFileName('');
    setPreview('');
    setProcessedImage('');
    setSelectedTab('original');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理本地文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择有效的图片文件');
      return;
    }

    // 检查文件大小 (限制为10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      setImageUrl(''); // 清空URL输入
      
      // 设置文件名
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setFileName(nameWithoutExt);
    };
    reader.onerror = () => {
      alert('文件读取失败，请重试');
    };
    reader.readAsDataURL(file);
  };

  // 触发文件选择
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // 优化的背景移除算法 - 多重策略
  const removeBackground = async () => {
    if (!preview) {
      alert('请先预览图片');
      return;
    }

    setIsProcessing(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 创建图片对象
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = (e) => {
          console.error('图片加载失败:', e);
          reject(new Error('无法加载图片，可能存在跨域限制'));
        };
        img.src = preview;
      });

      // 设置画布尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原图
      ctx.drawImage(img, 0, 0);

      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 多点采样获取背景色
      const backgroundColors: Array<{r: number, g: number, b: number, count: number}> = [];
      const samplePoints = [
        // 四个角落
        [0, 0], [canvas.width - 1, 0], [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1],
        // 边缘中点
        [Math.floor(canvas.width / 2), 0], [Math.floor(canvas.width / 2), canvas.height - 1],
        [0, Math.floor(canvas.height / 2)], [canvas.width - 1, Math.floor(canvas.height / 2)]
      ];

      samplePoints.forEach(([x, y]) => {
        const index = (y * canvas.width + x) * 4;
        if (index < data.length) {
          backgroundColors.push({
            r: data[index],
            g: data[index + 1],
            b: data[index + 2],
            count: 1
          });
        }
      });

      // 聚类分析找到主要背景色
      const clusters: Array<{r: number, g: number, b: number, count: number}> = [];
      const colorThreshold = 30;

      backgroundColors.forEach(color => {
        let found = false;
        for (let cluster of clusters) {
          const distance = Math.sqrt(
            Math.pow(color.r - cluster.r, 2) +
            Math.pow(color.g - cluster.g, 2) +
            Math.pow(color.b - cluster.b, 2)
          );
          if (distance < colorThreshold) {
            cluster.r = (cluster.r * cluster.count + color.r) / (cluster.count + 1);
            cluster.g = (cluster.g * cluster.count + color.g) / (cluster.count + 1);
            cluster.b = (cluster.b * cluster.count + color.b) / (cluster.count + 1);
            cluster.count++;
            found = true;
            break;
          }
        }
        if (!found) {
          clusters.push({...color});
        }
      });

      // 选择最大的聚类作为背景色
      const dominantBg = clusters.reduce((max, cluster) => 
        cluster.count > max.count ? cluster : max, clusters[0]);

      if (!dominantBg) {
        throw new Error('无法识别背景色');
      }

      // 自适应容差值
      let tolerance = 40;
      let removedPixels = 0;
      const totalPixels = data.length / 4;

      // 第一次尝试
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const distance = Math.sqrt(
          Math.pow(r - dominantBg.r, 2) +
          Math.pow(g - dominantBg.g, 2) +
          Math.pow(b - dominantBg.b, 2)
        );

        if (distance < tolerance) {
          data[i + 3] = 0;
          removedPixels++;
        }
      }

      // 如果移除的像素太少，增加容差再试一次
      if (removedPixels / totalPixels < 0.1) {
        tolerance = 60;
        removedPixels = 0;
        
        // 重新加载图像数据
        ctx.drawImage(img, 0, 0);
        const newImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const newData = newImageData.data;

        for (let i = 0; i < newData.length; i += 4) {
          const r = newData[i];
          const g = newData[i + 1];
          const b = newData[i + 2];

          const distance = Math.sqrt(
            Math.pow(r - dominantBg.r, 2) +
            Math.pow(g - dominantBg.g, 2) +
            Math.pow(b - dominantBg.b, 2)
          );

          if (distance < tolerance) {
            newData[i + 3] = 0;
            removedPixels++;
          }
        }

        ctx.putImageData(newImageData, 0, 0);
      } else {
        ctx.putImageData(imageData, 0, 0);
      }

      // 后处理：平滑边缘
      const smoothedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const smoothData = smoothedData.data;

      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          const index = (y * canvas.width + x) * 4;
          
          if (smoothData[index + 3] === 0) continue; // 跳过已透明的像素
          
          // 检查周围8个像素
          let transparentNeighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const neighborIndex = ((y + dy) * canvas.width + (x + dx)) * 4;
              if (smoothData[neighborIndex + 3] === 0) {
                transparentNeighbors++;
              }
            }
          }
          
          // 如果周围有很多透明像素，降低当前像素的不透明度
          if (transparentNeighbors >= 4) {
            smoothData[index + 3] = Math.max(0, smoothData[index + 3] - 100);
          }
        }
      }

      ctx.putImageData(smoothedData, 0, 0);

      // 转换为base64
      const processedDataUrl = canvas.toDataURL('image/png');
      setProcessedImage(processedDataUrl);
      setSelectedTab('processed');

      const removalRate = (removedPixels / totalPixels * 100).toFixed(1);
      console.log(`背景移除完成，移除了 ${removalRate}% 的像素`);

    } catch (error) {
      console.error('背景移除失败:', error);
      let errorMessage = '背景移除失败：';
      
      if (error instanceof Error) {
        if (error.message.includes('跨域')) {
          errorMessage += '图片存在跨域限制，请尝试下载图片到本地后重新上传。';
        } else if (error.message.includes('背景色')) {
          errorMessage += '无法识别图片背景，建议使用高级抠图功能。';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += '未知错误，请尝试其他图片或联系技术支持。';
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // 高级背景移除 - 组合多种算法
  const removeBackgroundAdvanced = async () => {
    if (!preview) {
      alert('请先预览图片');
      return;
    }

    setIsProcessing(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = (e) => {
          console.error('图片加载失败:', e);
          reject(new Error('无法加载图片，可能存在跨域限制'));
        };
        img.src = preview;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 1. 边缘检测预处理
      const grayData = new Uint8Array(canvas.width * canvas.height);
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        grayData[i / 4] = gray;
      }

      // 2. 改进的Sobel边缘检测
      const edges = new Float32Array(canvas.width * canvas.height);
      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          const idx = y * canvas.width + x;
          
          // Sobel X 和 Y 梯度
          const gx = -grayData[(y-1)*canvas.width + x-1] + grayData[(y-1)*canvas.width + x+1] +
                     -2*grayData[y*canvas.width + x-1] + 2*grayData[y*canvas.width + x+1] +
                     -grayData[(y+1)*canvas.width + x-1] + grayData[(y+1)*canvas.width + x+1];
          
          const gy = -grayData[(y-1)*canvas.width + x-1] - 2*grayData[(y-1)*canvas.width + x] - grayData[(y-1)*canvas.width + x+1] +
                     grayData[(y+1)*canvas.width + x-1] + 2*grayData[(y+1)*canvas.width + x] + grayData[(y+1)*canvas.width + x+1];
          
          edges[idx] = Math.sqrt(gx*gx + gy*gy);
        }
      }

      // 3. 区域生长算法
      const visited = new Uint8Array(canvas.width * canvas.height);
      const backgroundMask = new Uint8Array(canvas.width * canvas.height);
      
      // 从边缘开始种子点
      const seeds: Array<[number, number]> = [];
      const borderWidth = Math.min(20, Math.min(canvas.width, canvas.height) / 10);
      
      // 收集边缘种子点
      for (let x = 0; x < canvas.width; x += 5) {
        for (let y = 0; y < borderWidth; y++) seeds.push([x, y]);
        for (let y = canvas.height - borderWidth; y < canvas.height; y++) seeds.push([x, y]);
      }
      for (let y = 0; y < canvas.height; y += 5) {
        for (let x = 0; x < borderWidth; x++) seeds.push([x, y]);
        for (let x = canvas.width - borderWidth; x < canvas.width; x++) seeds.push([x, y]);
      }

      // 区域生长
      const queue: Array<[number, number]> = [...seeds];
      const colorThreshold = 25;
      const edgeThreshold = 20;

      while (queue.length > 0) {
        const [x, y] = queue.shift()!;
        const idx = y * canvas.width + x;
        
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height || visited[idx]) continue;
        
        visited[idx] = 1;
        
        // 如果边缘强度低，标记为背景
        if (edges[idx] < edgeThreshold) {
          backgroundMask[idx] = 1;
          
          // 添加相邻像素到队列
          const pixelIndex = idx * 4;
          const currentR = data[pixelIndex];
          const currentG = data[pixelIndex + 1];
          const currentB = data[pixelIndex + 2];
          
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              const nx = x + dx;
              const ny = y + dy;
              const nIdx = ny * canvas.width + nx;
              
              if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height && !visited[nIdx]) {
                const neighborPixelIndex = nIdx * 4;
                const neighborR = data[neighborPixelIndex];
                const neighborG = data[neighborPixelIndex + 1];
                const neighborB = data[neighborPixelIndex + 2];
                
                // 颜色相似性检查
                const colorDistance = Math.sqrt(
                  Math.pow(currentR - neighborR, 2) +
                  Math.pow(currentG - neighborG, 2) +
                  Math.pow(currentB - neighborB, 2)
                );
                
                if (colorDistance < colorThreshold) {
                  queue.push([nx, ny]);
                }
              }
            }
          }
        }
      }

      // 4. 应用蒙版并进行形态学处理
      let removedPixels = 0;
      for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = i / 4;
        if (backgroundMask[pixelIndex]) {
          data[i + 3] = 0;
          removedPixels++;
        }
      }

      // 5. 边缘平滑和反锯齿
      ctx.putImageData(imageData, 0, 0);
      const smoothedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const smoothData = smoothedData.data;

      // 多通道边缘平滑
      for (let pass = 0; pass < 2; pass++) {
        for (let y = 1; y < canvas.height - 1; y++) {
          for (let x = 1; x < canvas.width - 1; x++) {
            const index = (y * canvas.width + x) * 4;
            
            if (smoothData[index + 3] === 0) continue;
            
            let transparentNeighbors = 0;
            let opaqueNeighbors = 0;
            
            // 检查3x3邻域
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const neighborIndex = ((y + dy) * canvas.width + (x + dx)) * 4;
                if (smoothData[neighborIndex + 3] === 0) {
                  transparentNeighbors++;
                } else {
                  opaqueNeighbors++;
                }
              }
            }
            
            // 边缘像素的透明度渐变
            const ratio = transparentNeighbors / (transparentNeighbors + opaqueNeighbors);
            if (ratio > 0.3) {
              smoothData[index + 3] = Math.round(smoothData[index + 3] * (1 - ratio * 0.7));
            }
          }
        }
      }

      ctx.putImageData(smoothedData, 0, 0);

      const processedDataUrl = canvas.toDataURL('image/png');
      setProcessedImage(processedDataUrl);
      setSelectedTab('processed');

      const totalPixels = data.length / 4;
      const removalRate = (removedPixels / totalPixels * 100).toFixed(1);
      console.log(`高级抠图完成，移除了 ${removalRate}% 的像素`);

    } catch (error) {
      console.error('高级背景移除失败:', error);
      let errorMessage = '高级抠图失败：';
      
      if (error instanceof Error) {
        if (error.message.includes('跨域')) {
          errorMessage += '图片存在跨域限制，请尝试下载图片到本地后重新上传。';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += '未知错误，请检查图片格式是否支持。';
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // 下载处理后的图片
  const downloadProcessedImage = () => {
    if (!processedImage) {
      alert('请先处理图片');
      return;
    }

    const link = document.createElement('a');
    link.href = processedImage;
    const downloadFileName = fileName.includes('.') ? 
      fileName.replace(/\.[^/.]+$/, '_processed.png') : 
      `${fileName || 'processed_image'}.png`;
    link.download = downloadFileName;
    
    // 安全的DOM操作
    try {
      document.body.appendChild(link);
      link.click();
      
      // 安全地移除元素
      if (link.parentNode === document.body) {
        document.body.removeChild(link);
      }
    } catch (domError) {
      console.warn('DOM操作警告:', domError);
    }
    
    alert('处理后的图片下载成功！');
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
            {/* 图片来源选择 */}
            <div className={styles.sourceSection}>
              <div className={styles.sourceButtons}>
                <button
                  onClick={triggerFileUpload}
                  className={`${styles.button} ${styles.uploadButton}`}
                >
                  📁 选择本地图片
                </button>
                <span className={styles.sourceDivider}>或</span>
              </div>
              
              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* URL输入区域 */}
            <div className={styles.inputGroup}>
              <label htmlFor="imageUrl" className={styles.label}>
                图片URL <span className={styles.optional}>(网络图片)</span>
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
                disabled={!imageUrl.trim() && !preview}
              >
                👀 预览图片
              </button>
              
              <button
                onClick={downloadImage}
                disabled={(!imageUrl.trim() && !preview) || isDownloading}
                className={`${styles.button} ${styles.downloadButton}`}
              >
                {isDownloading ? '⏳ 下载中...' : '⬇️ 下载原图'}
              </button>

              <button
                onClick={clearForm}
                className={`${styles.button} ${styles.clearButton}`}
              >
                🗑️ 清空表单
              </button>
            </div>

            {/* 抠图功能区域 */}
            {preview && (
              <div className={styles.imageProcessSection}>
                <h3 className={styles.processSectionTitle}>🎨 图像处理</h3>
                <div className={styles.processButtonGroup}>
                  <button
                    onClick={removeBackground}
                    disabled={isProcessing}
                    className={`${styles.button} ${styles.processButton}`}
                  >
                    {isProcessing ? '🔄 处理中...' : '✂️ 智能抠图'}
                  </button>
                  
                  <button
                    onClick={removeBackgroundAdvanced}
                    disabled={isProcessing}
                    className={`${styles.button} ${styles.advancedProcessButton}`}
                  >
                    {isProcessing ? '🔄 处理中...' : '🔬 高级抠图'}
                  </button>

                  {processedImage && (
                    <button
                      onClick={downloadProcessedImage}
                      className={`${styles.button} ${styles.downloadProcessedButton}`}
                    >
                      💾 下载抠图
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 图片预览区域 */}
            {preview && (
              <div className={styles.previewSection}>
                <div className={styles.previewHeader}>
                  <h3 className={styles.previewTitle}>图片预览</h3>
                  {processedImage && (
                    <div className={styles.previewTabs}>
                      <button
                        onClick={() => setSelectedTab('original')}
                        className={`${styles.previewTab} ${selectedTab === 'original' ? styles.activePreviewTab : ''}`}
                      >
                        原图
                      </button>
                      <button
                        onClick={() => setSelectedTab('processed')}
                        className={`${styles.previewTab} ${selectedTab === 'processed' ? styles.activePreviewTab : ''}`}
                      >
                        抠图结果
                      </button>
                    </div>
                  )}
                </div>
                
                <div className={styles.previewContainer}>
                  {selectedTab === 'original' ? (
                    <img
                      src={preview}
                      alt="原图预览"
                      className={styles.previewImage}
                      onError={() => {
                        alert('图片加载失败，请检查URL是否正确');
                        setPreview('');
                      }}
                    />
                  ) : (
                    <div className={styles.processedImageContainer}>
                      <img
                        src={processedImage}
                        alt="抠图结果"
                        className={styles.previewImage}
                      />
                      <div className={styles.transparentBg}></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 隐藏的canvas用于图像处理 */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* 使用说明 */}
            <div className={styles.helpSection}>
              <h3 className={styles.helpTitle}>💡 使用说明</h3>
              <ul className={styles.helpList}>
                <li>选择本地图片文件或在URL输入框中粘贴网络图片地址</li>
                <li>本地上传支持JPG、PNG、GIF、WebP等格式，最大10MB</li>
                <li>可以自定义下载的文件名（可选）</li>
                <li>点击"预览图片"查看图片效果</li>
                <li>点击"下载原图"将原始图片保存到本地</li>
                <li>使用"智能抠图"可以自动移除简单背景</li>
                <li>使用"高级抠图"可以处理复杂背景和精细边缘</li>
                <li>抠图结果会以PNG格式保存，保留透明背景</li>
                <li className={styles.corsWarning}>
                  <strong>⚠️ 跨域问题：</strong>某些网站的图片可能因跨域限制无法直接下载，
                  系统会自动尝试代理下载。如仍失败，请使用右键保存或本地上传功能
                </li>
                <li>处理大尺寸图片可能需要较长时间，请耐心等待</li>
              </ul>
            </div>

            {/* 跨域问题说明 */}
            <div className={styles.corsSection}>
              <h3 className={styles.corsTitle}>🌐 关于跨域问题</h3>
              <div className={styles.corsContent}>
                <p className={styles.corsDescription}>
                  <strong>跨域资源共享（CORS）</strong>是浏览器的安全机制，用于防止恶意网站访问其他域的资源。
                  当图片服务器未设置适当的CORS头时，JavaScript无法直接下载图片。
                </p>
                
                <div className={styles.corsExamples}>
                  <div className={styles.corsExample}>
                    <h4>✅ 通常支持的图片源</h4>
                    <ul>
                      <li>GitHub、GitLab等代码托管平台</li>
                      <li>一些CDN服务（如jsDelivr、unpkg等）</li>
                      <li>设置了CORS的个人服务器</li>
                      <li>本地上传的图片文件</li>
                    </ul>
                  </div>
                  
                  <div className={styles.corsExample}>
                    <h4>❌ 可能受限的图片源</h4>
                    <ul>
                      <li>社交媒体平台（微博、Twitter等）</li>
                      <li>电商网站的商品图片</li>
                      <li>新闻网站的图片</li>
                      <li>未设置CORS的个人网站</li>
                    </ul>
                  </div>
                </div>

                <div className={styles.corsWorkaround}>
                  <h4>🔧 解决方案</h4>
                  <ol>
                    <li><strong>自动代理</strong>：系统会自动尝试通过服务器代理下载</li>
                    <li><strong>右键保存</strong>：在预览图片上右键选择"图片另存为"</li>
                    <li><strong>新标签页</strong>：在新标签页中打开图片链接后保存</li>
                    <li><strong>本地上传</strong>：先下载到本地，再使用本地上传功能</li>
                  </ol>
                </div>
              </div>
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
                  <div className={styles.featureIcon}>✂️</div>
                  <div className={styles.featureText}>
                    <strong>智能抠图</strong>
                    <p>AI算法自动移除图片背景</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🔬</div>
                  <div className={styles.featureText}>
                    <strong>高级处理</strong>
                    <p>基于边缘检测的精确抠图</p>
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