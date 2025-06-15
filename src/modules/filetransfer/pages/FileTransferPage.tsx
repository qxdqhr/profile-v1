/**
 * FileTransferPage 组件
 * 
 * 文件传输模块的主页面
 * 包含文件上传和传输列表功能
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FileTransferCard } from '../components/FileTransferCard';
import { FileUploader } from '../components/FileUploader';
import type { FileTransfer } from '../types';

export default function FileTransferPage() {
  const [transfers, setTransfers] = useState<FileTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载传输列表
  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      // TODO: 实现从API获取传输列表
      const response = await fetch('/api/filetransfer/transfers');
      if (!response.ok) throw new Error('获取传输列表失败');
      const data = await response.json();
      setTransfers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理文件上传
  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/filetransfer/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('上传失败');
      
      const newTransfer = await response.json();
      setTransfers(prev => [newTransfer, ...prev]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '上传失败');
    }
  };

  // 处理文件下载
  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`/api/filetransfer/download/${id}`);
      if (!response.ok) throw new Error('下载失败');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = transfers.find(t => t.id === id)?.fileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : '下载失败');
    }
  };

  // 处理文件删除
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/filetransfer/transfers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('删除失败');
      
      setTransfers(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">文件中转站</h1>
          <p className="mt-2 text-sm text-gray-600">
            安全、快速的文件传输服务
          </p>
        </div>

        {/* 上传区域 */}
        <div className="mb-8">
          <FileUploader
            onUpload={handleUpload}
            maxFileSize={100 * 1024 * 1024} // 100MB
            allowedFileTypes={['*']}
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* 传输列表 */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : transfers.length > 0 ? (
            transfers.map(transfer => (
              <FileTransferCard
                key={transfer.id}
                transfer={transfer}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">暂无传输记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 