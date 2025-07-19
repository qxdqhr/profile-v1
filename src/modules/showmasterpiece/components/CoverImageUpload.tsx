/**
 * 画集封面图片上传组件
 * 使用通用文件服务，支持阿里云OSS存储
 */

'use client';

import React, { useState, useEffect } from 'react';

interface CoverImageUploadProps {
  /** 当前图片值（URL） */
  value?: string;
  /** 通用文件服务的文件ID */
  fileId?: string;
  /** 值变化回调，返回包含image和fileId的对象 */
  onChange: (data: { image?: string; fileId?: string }) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 标签文本 */
  label?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

export const CoverImageUpload: React.FC<CoverImageUploadProps> = ({
  value,
  fileId,
  onChange,
  placeholder = "上传封面图片",
  label = "封面图片",
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [inputId] = useState(() => `cover-upload-${Math.random().toString(36).substr(2, 9)}`);

  // 处理通用文件服务上传
  const handleUniversalUpload = async (file: File) => {
    setUploading(true);
    try {
      console.log('🚀 [CoverImageUpload] 开始通用文件服务上传:', file.name);
      
      // 创建FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('moduleId', 'showmasterpiece');
      formData.append('businessId', 'cover');
      formData.append('needsProcessing', 'true');
      
      // 调用通用文件上传API
      const response = await fetch('/api/universal-file/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '上传失败');
      }
      
      console.log('✅ [CoverImageUpload] 通用文件服务上传成功:', {
        fileId: result.data.fileId,
        accessUrl: result.data.accessUrl
      });
      
      // 更新状态为使用新的文件服务
      onChange({
        image: result.data.accessUrl, // 使用访问URL
        fileId: result.data.fileId
      });
      
    } catch (error) {
      console.error('❌ [CoverImageUpload] 通用文件服务上传失败:', error);
      
      // 上传失败时的友好提示
      alert(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
      
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = async (file: File) => {
    console.log('🎯 [CoverImageUpload] 文件选择事件触发:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    await handleUniversalUpload(file);
  };

  // 渲染文件上传界面
  const renderUploadArea = () => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };

    return (
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => document.getElementById(inputId)?.click()}
      >
        {/* 文件选择器 */}
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          disabled={disabled || uploading}
          id={inputId}
          className="hidden"
        />
        
        {/* 显示内容 */}
        <div className="text-gray-500">
          {uploading ? (
            <>
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>正在上传到云存储...</p>
            </>
          ) : (
            <>
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium">点击选择封面图片</p>
              <p className="text-sm">支持 JPG、PNG、GIF、WebP 格式</p>
              <p className="text-xs text-blue-600 mt-2">
                自动上传到阿里云OSS，享受CDN加速
              </p>
            </>
          )}
        </div>
      </div>
    );
  };

  // 渲染预览
  const renderPreview = () => {
    if (!value && !fileId) {
      return null;
    }

    const imageUrl = value || (fileId ? `/api/universal-file/${fileId}` : '');

    return (
      <div className="mt-4">
        <div className="relative inline-block">
          <img
            src={imageUrl}
            alt="封面预览"
            className="max-w-full h-auto max-h-48 rounded-lg border"
            onError={(e) => {
              console.error('图片加载失败:', imageUrl);
              e.currentTarget.style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => onChange({ image: undefined, fileId: undefined })}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            title="删除图片"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {renderUploadArea()}
      {renderPreview()}
      
      {/* 当前值显示 */}
      {(value || fileId) && (
        <div className="text-xs text-gray-500">
          {fileId && <div>文件ID: {fileId}</div>}
          {value && <div>访问URL: {value}</div>}
        </div>
      )}
    </div>
  );
}; 