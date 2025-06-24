/**
 * 通用文件上传组件
 * 支持图片、音频、3D模型等各种文件类型的上传
 * 集成URL输入、拖拽上传、进度显示、文件预览等功能
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, AlertTriangle, Link, FileIcon, Image, Music, Cog } from 'lucide-react';

export interface UniversalFileUploaderProps {
  /** 当前值（URL或base64） */
  value?: string;
  /** 值变化回调 */
  onChange: (value: string | undefined) => void;
  /** 接受的文件类型 */
  accept?: string;
  /** 最大文件大小（字节） */
  maxFileSize?: number;
  /** 占位符文本 */
  placeholder?: string;
  /** 标签文本 */
  label?: string;
  /** 是否支持URL输入 */
  enableUrlInput?: boolean;
  /** 上传API端点 */
  uploadEndpoint?: string;
  /** 文件类型（影响图标和预览） */
  fileType?: 'image' | 'audio' | 'model' | 'any';
  /** 自定义样式类名 */
  className?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 错误回调 */
  onError?: (error: string) => void;
  /** 上传成功回调 */
  onSuccess?: (result: any) => void;
}

export function UniversalFileUploader({
  value,
  onChange,
  accept = '*/*',
  maxFileSize = 100 * 1024 * 1024, // 100MB
  placeholder = '选择文件或输入URL',
  label = '文件',
  enableUrlInput = true,
  uploadEndpoint,
  fileType = 'any',
  className = '',
  disabled = false,
  onError,
  onSuccess,
}: UniversalFileUploaderProps) {
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>(enableUrlInput ? 'url' : 'upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState(value || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 验证文件
  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `文件大小超过限制（最大 ${formatFileSize(maxFileSize)}）`;
    }
    
    // 如果有特定的accept规则，验证文件扩展名
    if (accept !== '*/*') {
      const fileName = file.name.toLowerCase();
      const extensions = accept.split(',').map(ext => ext.trim());
      
      // 检查是否是文件扩展名格式（以.开头）
      const isExtensionFormat = extensions.some(ext => ext.startsWith('.'));
      
      if (isExtensionFormat) {
        // 基于文件扩展名验证
        const hasValidExtension = extensions.some(ext => fileName.endsWith(ext.toLowerCase()));
        if (!hasValidExtension) {
          return `不支持的文件格式。支持的格式: ${extensions.join(', ')}`;
        }
      } else {
        // 基于MIME类型验证（保持向后兼容）
        if (!file.type.match(accept.replace(/\*/g, '.*'))) {
          return `不支持的文件类型：${file.type}`;
        }
      }
    }
    
    return null;
  };

  // 获取文件类型图标
  const getFileIcon = () => {
    switch (fileType) {
      case 'image':
        return <Image className="w-12 h-12" />;
      case 'audio':
        return <Music className="w-12 h-12" />;
      case 'model':
        return <Cog className="w-12 h-12" />;
      default:
        return <FileIcon className="w-12 h-12" />;
    }
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // 注释掉服务器上传功能，只进行前端处理
      // if (uploadEndpoint) {
      //   // 上传到服务器
      //   const formData = new FormData();
      //   formData.append('file', file);
      //   
      //   // 从URL参数中提取type，或根据fileType推断
      //   const url = new URL(uploadEndpoint, window.location.origin);
      //   const typeFromUrl = url.searchParams.get('type');
      //   if (typeFromUrl) {
      //     formData.append('type', typeFromUrl);
      //   } else {
      //     // 根据fileType推断
      //     let inferredType = 'model'; // 默认
      //     if (fileType === 'audio') inferredType = 'audio';
      //     else if (fileType === 'model') inferredType = 'model';
      //     formData.append('type', inferredType);
      //   }

      //   // 模拟进度
      //   const progressInterval = setInterval(() => {
      //     setProgress(prev => {
      //       if (prev >= 90) {
      //         clearInterval(progressInterval);
      //         return prev;
      //       }
      //       return prev + 10;
      //     });
      //   }, 200);

      //   const response = await fetch(uploadEndpoint, {
      //     method: 'POST',
      //     body: formData,
      //   });

      //   clearInterval(progressInterval);

      //   if (!response.ok) {
      //     const errorData = await response.json().catch(() => ({}));
      //     throw new Error(errorData.error || '上传失败');
      //   }

      //   const result = await response.json();
      //   setProgress(100);
      //   
      //   onChange(result.url || result.path);
      //   onSuccess?.(result);
      // } else {

      // 前端直接处理文件，不上传到服务器
      console.log('本地文件处理模式，文件名:', file.name, '大小:', formatFileSize(file.size));
      
      // 模拟处理进度
      setProgress(30);
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(100);

      // 创建本地URL用于标识
      const localUrl = URL.createObjectURL(file);
      
      // 返回文件信息给父组件
      const result = {
        file: file,          // 原始File对象
        localUrl: localUrl,  // 本地URL
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        // 这里不再有服务器端的id和url
      };
      
      onChange(localUrl);  // 传递本地URL给onChange
      onSuccess?.(result); // 传递完整结果给onSuccess

      // }
      
      // 原有的base64处理逻辑保持不变作为备用
      // } else {
      //   // 转换为base64（用于预览或小文件）
      //   const reader = new FileReader();
      //   reader.onload = (e) => {
      //     const result = e.target?.result as string;
      //     onChange(result);
      //     setProgress(100);
      //     onSuccess?.({ base64: result });
      //   };
      //   reader.onerror = () => {
      //     throw new Error('文件读取失败');
      //   };
      //   reader.readAsDataURL(file);
      // }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '文件处理失败';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 2000); // 2秒后重置进度
    }
  };

  // 处理拖拽事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [disabled]);

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 处理URL输入
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempUrl(e.target.value);
  };

  const handleApplyUrl = () => {
    onChange(tempUrl || undefined);
    setError(null);
  };

  // 清除文件
  const handleClear = () => {
    onChange(undefined);
    setTempUrl('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 打开文件选择器
  const handleUploadClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  // 获取预览组件
  const renderPreview = () => {
    if (!value) return null;

    switch (fileType) {
      case 'image':
        return (
          <div className="mt-4 relative">
            <img 
              src={value} 
              alt="预览" 
              className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/90 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      case 'audio':
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <audio controls className="w-full">
              <source src={value} />
              您的浏览器不支持音频播放。
            </audio>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">音频文件</span>
              <button
                type="button"
                onClick={handleClear}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                删除
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileIcon size={20} className="text-gray-500" />
                <span className="text-sm text-gray-700">已选择文件</span>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                删除
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* 模式切换 */}
      {enableUrlInput && (
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
              uploadMode === 'url'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setUploadMode('url')}
            disabled={disabled}
          >
            <Link size={16} />
            URL链接
          </button>
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
              uploadMode === 'upload'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setUploadMode('upload')}
            disabled={disabled}
          >
            <Upload size={16} />
            文件上传
          </button>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-800">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* URL输入模式 */}
      {enableUrlInput && uploadMode === 'url' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={tempUrl}
              onChange={handleUrlChange}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              disabled={disabled}
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              disabled={disabled || !tempUrl}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              应用
            </button>
          </div>
        </div>
      )}

      {/* 文件上传模式 */}
      {(!enableUrlInput || uploadMode === 'upload') && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragging 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
            ${isUploading || disabled ? 'opacity-60 cursor-not-allowed' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />

          <div className="flex flex-col items-center gap-4">
            {/* 图标 */}
            <div className={`
              p-4 rounded-full transition-colors
              ${isDragging || isUploading 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-500'
              }
            `}>
              {isUploading ? (
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                getFileIcon()
              )}
            </div>

            {/* 文本 */}
            <div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                {isUploading 
                  ? '正在上传...' 
                  : isDragging 
                    ? '松开鼠标上传文件' 
                    : '点击上传或拖拽文件到此处'
                }
              </p>
              <p className="text-sm text-gray-500">
                支持 {accept === '*/*' ? '所有格式' : accept}，最大 {formatFileSize(maxFileSize)}
              </p>
            </div>

            {/* 进度条 */}
            {isUploading && progress > 0 && (
              <div className="w-full max-w-xs">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">{progress}%</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 预览 */}
      {renderPreview()}
    </div>
  );
} 