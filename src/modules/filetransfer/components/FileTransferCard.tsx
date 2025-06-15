/**
 * FileTransferCard 组件
 * 
 * 用于显示单个文件传输任务的卡片组件
 * 包含文件信息、传输状态和操作按钮
 */

'use client';

import React from 'react';
import { File, Download, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { FileTransfer } from '../types';

interface FileTransferCardProps {
  transfer: FileTransfer;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FileTransferCard({ transfer, onDownload, onDelete }: FileTransferCardProps) {
  // 获取文件大小的人类可读格式
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 获取状态图标和颜色
  const getStatusInfo = () => {
    switch (transfer.status) {
      case 'completed':
        return { icon: CheckCircle2, color: 'text-green-500' };
      case 'failed':
        return { icon: AlertCircle, color: 'text-red-500' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-500' };
      default:
        return { icon: Clock, color: 'text-gray-500' };
    }
  };

  const { icon: StatusIcon, color: statusColor } = getStatusInfo();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        {/* 文件图标 */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <File className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        {/* 文件信息 */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {transfer.fileName}
            </h3>
            <span className={`flex items-center text-sm ${statusColor}`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {transfer.status}
            </span>
          </div>
          
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <span>{formatFileSize(transfer.fileSize)}</span>
            <span className="mx-2">•</span>
            <span>{new Date(transfer.createdAt).toLocaleString()}</span>
          </div>

          {/* 进度条 */}
          {transfer.status === 'pending' && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${transfer.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex-shrink-0 flex space-x-2">
          {transfer.status === 'completed' && (
            <button
              onClick={() => onDownload(transfer.id)}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="下载文件"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(transfer.id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="删除文件"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 