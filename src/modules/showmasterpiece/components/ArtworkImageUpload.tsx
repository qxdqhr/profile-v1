/**
 * 作品图片上传组件
 * 支持新的通用文件服务和传统Base64图片上传两种模式
 */

'use client';

import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';

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
  /** 是否强制使用通用文件服务（默认false） */
  forceUniversalMode?: boolean;
}

export const ArtworkImageUpload: React.FC<ArtworkImageUploadProps> = ({
  value,
  fileId,
  onChange,
  placeholder = "输入作品图片URL或上传本地图片",
  label = "作品图片",
  disabled = false,
  forceUniversalMode = false
}) => {
  const [uploadMode, setUploadMode] = useState<'legacy' | 'universal'>(
    forceUniversalMode ? 'universal' : 'legacy'
  );
  const [uploading, setUploading] = useState(false);

  // 处理传统Base64上传模式
  const handleLegacyUpload = (imageValue: string) => {
    if (imageValue) {
      // 传统模式：将图片数据存储为Base64
      onChange({
        image: imageValue,
        fileId: undefined // 清除fileId
      });
    } else {
      // 清除图片
      onChange({
        image: undefined,
        fileId: undefined
      });
    }
  };

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
      
      // 不再回退到传统模式，让用户重试或选择其他文件
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // 处理文件选择（根据当前模式决定处理方式）
  const handleFileSelect = async (file: File) => {
    if (uploadMode === 'universal') {
      await handleUniversalUpload(file);
    } else {
      // 传统模式：转换为Base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        handleLegacyUpload(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // 渲染上传模式切换
  const renderModeSwitch = () => {
    if (forceUniversalMode) return null;
    
    return (
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          className={`px-3 py-1 text-sm rounded ${
            uploadMode === 'legacy' 
              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
              : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}
          onClick={() => setUploadMode('legacy')}
          disabled={disabled || uploading}
        >
          传统上传
        </button>
        <button
          type="button"
          className={`px-3 py-1 text-sm rounded ${
            uploadMode === 'universal' 
              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
              : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}
          onClick={() => setUploadMode('universal')}
          disabled={disabled || uploading}
          title="通用文件服务（支持OSS和CDN）"
        >
          文件服务 {uploading && '(上传中...)'}
        </button>
      </div>
    );
  };

  // 渲染自定义文件上传组件（仅用于通用文件服务模式）
  const renderUniversalUpload = () => {
    if (uploadMode !== 'universal') return null;

    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileSelect(file);
            }
          }}
          disabled={disabled || uploading}
          className="hidden"
          id={`universal-file-upload-${Math.random()}`}
        />
        <label 
          htmlFor={`universal-file-upload-${Math.random()}`}
          className={`cursor-pointer ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
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
                <p className="text-lg font-medium">点击选择图片文件</p>
                <p className="text-sm">支持 JPG、PNG、GIF、WebP 格式</p>
                <p className="text-xs text-gray-400 mt-2">
                  将自动上传到云存储并优化，享受CDN加速
                </p>
              </>
            )}
          </div>
        </label>
      </div>
    );
  };

  return (
    <div>
      {/* 模式切换 */}
      {renderModeSwitch()}
      
      {/* 当前状态指示 */}
      {fileId && (
        <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          ✅ 使用通用文件服务存储 (ID: {fileId.substring(0, 8)}...)
          <br />
          <span className="text-xs text-green-600">
            已上传到云存储，享受CDN加速和优化的图片加载性能
          </span>
        </div>
      )}
      
      {uploadMode === 'universal' && (
        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          🚀 通用文件服务模式已启用
          <br />
          <span className="text-xs text-blue-600">
            图片将上传到阿里云OSS并通过CDN分发，提供更好的性能和用户体验
          </span>
        </div>
      )}
      
      {/* 通用文件服务上传界面 */}
      {renderUniversalUpload()}
      
      {/* 传统图片上传组件 */}
      {uploadMode === 'legacy' && (
        <>
          <ImageUpload
            label={label}
            value={value || ''}
            onChange={handleLegacyUpload}
            placeholder={placeholder}
          />
          
          {/* 说明文字 */}
          <div className="mt-2 text-xs text-gray-500">
            当前使用传统Base64存储模式。推荐切换到文件服务模式以获得更好的性能。
          </div>
        </>
      )}
    </div>
  );
}; 