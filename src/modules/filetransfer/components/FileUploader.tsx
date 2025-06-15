/**
 * FileUploader 组件
 * 
 * 提供文件上传功能的组件
 * 支持拖拽上传和点击上传
 * 显示上传进度和状态
 */

'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import type { FileTransfer } from '../types';

interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

export function FileUploader({ 
  onUpload, 
  maxFileSize = 100 * 1024 * 1024, // 默认100MB
  allowedFileTypes = ['*'] 
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 验证文件
  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `文件大小超过限制（最大 ${formatFileSize(maxFileSize)}）`;
    }
    
    if (allowedFileTypes[0] !== '*' && !allowedFileTypes.includes(file.type)) {
      return `不支持的文件类型：${file.type}`;
    }
    
    return null;
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  // 处理拖拽事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="w-full">
      {/* 拖拽上传区域 */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8
          flex flex-col items-center justify-center
          transition-colors duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
        
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">
            {isUploading ? '正在上传...' : '拖拽文件到此处或点击上传'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            支持的文件大小：最大 {formatFileSize(maxFileSize)}
          </p>
          {allowedFileTypes[0] !== '*' && (
            <p className="mt-1 text-sm text-gray-500">
              支持的文件类型：{allowedFileTypes.join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="ml-3 text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto flex-shrink-0"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
} 