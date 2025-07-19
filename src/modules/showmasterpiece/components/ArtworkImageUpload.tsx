/**
 * 作品图片上传组件
 * 使用通用文件服务，支持阿里云OSS存储
 */

'use client';

import React, { useState, useEffect } from 'react';

interface ArtworkImageUploadProps {
  /** 当前图片值（Base64或URL） */
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

export const ArtworkImageUpload: React.FC<ArtworkImageUploadProps> = ({
  value,
  fileId,
  onChange,
  placeholder = "上传作品图片",
  label = "作品图片",
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [inputId] = useState(() => `universal-file-upload-${Math.random().toString(36).substr(2, 9)}`);

  // 检查input元素是否存在
  useEffect(() => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    console.log('🔍 [ArtworkImageUpload] 组件挂载，检查input元素:', {
      inputId,
      inputExists: !!input,
      inputType: input?.type,
      inputDisabled: input?.disabled
    });
  }, [inputId]);

  // 处理通用文件服务上传
  const handleUniversalUpload = async (file: File) => {
    setUploading(true);
    try {
      console.log('🚀 [ArtworkImageUpload] 开始通用文件服务上传:', file.name);
      
      // 创建FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('moduleId', 'showmasterpiece');
      formData.append('businessId', 'artwork');
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
      
      console.log('✅ [ArtworkImageUpload] 通用文件服务上传成功:', {
        fileId: result.data.fileId,
        accessUrl: result.data.accessUrl
      });
      
      // 更新状态为使用新的文件服务
      onChange({
        image: undefined, // 清除旧的Base64数据
        fileId: result.data.fileId
      });
      
    } catch (error) {
      console.error('❌ [ArtworkImageUpload] 通用文件服务上传失败:', error);
      
      // 上传失败时的友好提示
      alert(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
      
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = async (file: File) => {
    console.log('🎯 [ArtworkImageUpload] 文件选择事件触发:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    await handleUniversalUpload(file);
  };

  // 渲染文件上传界面
  const renderUploadArea = () => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log('🎯 [ArtworkImageUpload] input change事件触发:', e.target.files);
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };

    const handleLabelClick = (e: React.MouseEvent) => {
      console.log('🎯 [ArtworkImageUpload] label点击事件触发');
      e.preventDefault();
      e.stopPropagation();
    };

    const handleTestClick = (e: React.MouseEvent) => {
      console.log('🎯 [ArtworkImageUpload] 测试按钮点击事件触发');
      e.preventDefault();
      e.stopPropagation();
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (input) {
        console.log('🎯 [ArtworkImageUpload] 找到input元素，触发click');
        input.click();
      } else {
        console.error('❌ [ArtworkImageUpload] 未找到input元素');
      }
    };

    const handleDivClick = (e: React.MouseEvent) => {
      console.log('🎯 [ArtworkImageUpload] div点击事件触发');
    };

    return (
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
        onClick={handleDivClick}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* 简单的文件选择器 */}
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          disabled={disabled || uploading}
          id={inputId}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            opacity: 0, 
            cursor: 'pointer',
            zIndex: 10
          }}
        />
        
        {/* 显示内容 */}
        <div className="text-gray-500 pointer-events-none">
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
              <p className="text-lg font-medium">点击选择图片文件</p>
              <p className="text-sm">支持 JPG、PNG、GIF、WebP 格式</p>
              <p className="text-xs text-blue-600 mt-2">
                自动上传到阿里云OSS，享受CDN加速
              </p>
            </>
          )}
        </div>
        
        {/* 测试按钮 */}
        <button
          type="button"
          onClick={handleTestClick}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          style={{ position: 'relative', zIndex: 20 }}
        >
          测试：直接触发文件选择器
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* 当前状态指示 */}
      {fileId && (
        <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          ✅ 已上传到云存储 (ID: {fileId.substring(0, 8)}...)
          <br />
          <span className="text-xs text-green-600">
            享受CDN加速和优化的图片加载性能
          </span>
        </div>
      )}
      
      {/* 调试信息 */}
      <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
        🔍 调试信息: inputId = {inputId}, disabled = {disabled.toString()}, uploading = {uploading.toString()}
      </div>
      
      {/* 上传区域 */}
      {renderUploadArea()}
      
      {/* 说明文字 */}
      <div className="mt-2 text-xs text-gray-500">
        图片将自动上传到阿里云OSS并通过CDN分发，提供更好的性能和用户体验
      </div>
    </div>
  );
}; 