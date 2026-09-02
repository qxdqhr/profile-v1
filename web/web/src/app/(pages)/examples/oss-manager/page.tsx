'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { 
  Folder, 
  File, 
  ArrowLeft, 
  Trash2, 
  Edit3, 
  Move, 
  Plus, 
  Upload, 
  RefreshCw, 
  ChevronRight, 
  Search,
  ExternalLink,
  Image as ImageIcon,
  FileText,
  MoreVertical,
  Download
} from 'lucide-react';

interface OSSFile {
  name: string;
  url: string;
  size: number;
  lastModified: string;
  etag: string;
  type: 'file';
}

export default function OSSManagerPage() {
  const [currentPrefix, setCurrentPrefix] = useState('');
  const [files, setFiles] = useState<OSSFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<OSSFile | null>(null);

  const fetchFiles = useCallback(async (prefix: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/examples/oss/list?prefix=' + encodeURIComponent(prefix));
      if (!res.ok) throw new Error('Failed to fetch files');
      const data = await res.json();
      setFiles(data.files || []);
      setFolders(data.folders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles(currentPrefix);
  }, [currentPrefix, fetchFiles]);

  const navigateToFolder = (folder: string) => {
    setCurrentPrefix(folder);
  };

  const navigateUp = () => {
    const parts = currentPrefix.split('/').filter(Boolean);
    parts.pop();
    const parentPrefix = parts.length > 0 ? parts.join('/') + '/' : '';
    setCurrentPrefix(parentPrefix);
  };

  const handleDelete = async (path: string) => {
    if (!confirm('Are you sure you want to delete ' + path + '?')) return;
    
    try {
      const res = await fetch('/api/examples/oss/delete?path=' + encodeURIComponent(path), {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchFiles(currentPrefix);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRename = async (sourcePath: string) => {
    const fileName = sourcePath.split('/').pop();
    const newName = prompt('Enter new name:', fileName);
    if (!newName || newName === fileName) return;

    const parts = sourcePath.split('/');
    parts.pop();
    const targetPath = (parts.length > 0 ? parts.join('/') + '/' : '') + newName;

    try {
      const res = await fetch('/api/examples/oss/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcePath, targetPath }),
      });
      if (!res.ok) throw new Error('Rename failed');
      fetchFiles(currentPrefix);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', currentPrefix + file.name);

    try {
      const res = await fetch('/api/examples/oss/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      fetchFiles(currentPrefix);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFolders = folders.filter(f => 
    f.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">OSS 文件管理</h1>
            <p className="text-sm text-gray-500 mt-1">管理您的阿里云 OSS 存储空间</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchFiles(currentPrefix)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="刷新"
            >
              <RefreshCw className={clsx('w-5 h-5', loading ? 'animate-spin' : '')} />
            </button>
            
            <div className="relative">
              <Upload className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="file" 
                onChange={handleUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <button className="pl-10 pr-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300">
                {uploading ? '上传中...' : '上传文件'}
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar & Breadcrumbs */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1">
            <button 
              onClick={() => setCurrentPrefix('')}
              className="text-gray-500 hover:text-blue-600 font-medium whitespace-nowrap"
            >
              Root
            </button>
            {currentPrefix.split('/').filter(Boolean).map((part, idx, arr) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <button 
                  onClick={() => setCurrentPrefix(arr.slice(0, idx + 1).join('/') + '/')}
                  className="text-gray-500 hover:text-blue-600 font-medium whitespace-nowrap"
                >
                  {part}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索文件或文件夹..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500 animate-pulse">正在加载文件...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">名称</th>
                    <th className="px-6 py-3">大小</th>
                    <th className="px-6 py-3">修改时间</th>
                    <th className="px-6 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Parent folder back button */}
                  {currentPrefix !== '' && (
                    <tr 
                      className="hover:bg-gray-50 cursor-pointer group"
                      onClick={navigateUp}
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-gray-600 font-medium italic">返回上一级</span>
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  )}

                  {/* Folders */}
                  {filteredFolders.map(folder => (
                    <tr 
                      key={folder}
                      className="hover:bg-gray-50 cursor-pointer group"
                      onClick={() => navigateToFolder(folder)}
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <Folder className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />
                        <span className="text-gray-900 font-medium">
                          {folder.replace(currentPrefix, '').replace('/', '')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">—</td>
                      <td className="px-6 py-4 text-sm text-gray-500">—</td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 inline-block" />
                      </td>
                    </tr>
                  ))}

                  {/* Files */}
                  {filteredFiles.map(file => (
                    <tr key={file.name} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4 flex items-center gap-3">
                        {isImage(file.name) ? (
                          <ImageIcon className="w-5 h-5 text-purple-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-blue-500" />
                        )}
                        <span className="text-gray-900 font-medium truncate max-w-md">
                          {file.name.replace(currentPrefix, '')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatSize(file.size)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(file.lastModified).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="预览"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => handleRename(file.name)}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="重命名"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(file.name)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Empty state */}
                  {!loading && filteredFiles.length === 0 && filteredFolders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <Folder className="w-12 h-12 text-gray-200 mb-4" />
                          <p className="text-gray-500">文件夹为空</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
