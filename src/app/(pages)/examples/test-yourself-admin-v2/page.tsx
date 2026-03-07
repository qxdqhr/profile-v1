'use client';

/**
 * 测测你是什么 - 简化配置管理页面（V2）
 * Test Yourself - Simplified Admin Page
 * 
 * 核心功能：
 * 1. 设置配置 key（用作 URL query 参数）
 * 2. 使用通用上传组件批量上传图片
 * 3. 自动关联图片和结果
 */

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  Save, 
  Upload as UploadIcon, 
  Trash2, 
  Eye, 
  Copy,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  X,
} from 'lucide-react';
import { createConfigService } from 'sa2kit/testYourself/server';
import type { SavedConfig, TestResult } from 'sa2kit/testYourself';

// 模拟 UniversalFile 客户端（后续会替换为真实实现）
interface UploadedFile {
  id: string;
  url: string;
  originalName: string;
  size: number;
}

export default function TestYourselfAdminV2Page() {
  // 配置服务
  const [configService] = useState(() => createConfigService());
  const [storageType, setStorageType] = useState<string>('loading');

  // 表单状态
  const [configKey, setConfigKey] = useState('');
  const [configName, setConfigName] = useState('');
  const [gameTitle, setGameTitle] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [buttonText, setButtonText] = useState('按住测试');
  const [longPressDuration, setLongPressDuration] = useState(3000);

  // 上传的图片列表
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // 结果配置（标题和描述）
  const [resultTitles, setResultTitles] = useState<string[]>([]);
  const [resultDescriptions, setResultDescriptions] = useState<string[]>([]);

  // UI 状态
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);

  // 检测存储类型
  useEffect(() => {
    const detectStorage = async () => {
      try {
        const response = await fetch('/api/examples/test-configs');
        if (response.ok) {
          const data = await response.json();
          setStorageType(data.storageType || 'localStorage');
        }
      } catch (error) {
        console.error('检测存储类型失败:', error);
        setStorageType('localStorage');
      }
    };
    detectStorage();
    loadConfigs();
  }, []);

  // 加载配置列表
  const loadConfigs = async () => {
    try {
      if (typeof configService.init === 'function') {
        await configService.init();
      }
      const configs = await configService.getAllConfigs();
      setSavedConfigs(configs);
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // TODO: 替换为真实的 UniversalFile 上传
      // const fileService = getFileService();
      
      const newFiles: UploadedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 临时使用 Base64（实际应该上传到 OSS）
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        newFiles.push({
          id: 'file-' + (Date.now()) + '-' + (i),
          url: base64,
          originalName: file.name,
          size: file.size,
        });

        // 自动添加对应的结果标题和描述
        setResultTitles(prev => [...prev, '结果 ' + (uploadedFiles.length + newFiles.length)]);
        setResultDescriptions(prev => [...prev, '请填写描述...']);
      }

      setUploadedFiles(prev => [...prev, ...newFiles]);
      setMessage({ type: 'success', text: '成功上传 ' + (newFiles.length) + ' 张图片' });
    } catch (error) {
      console.error('上传失败:', error);
      setMessage({ type: 'error', text: '上传失败' });
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // 删除图片
  const handleDeleteFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setResultTitles(prev => prev.filter((_, i) => i !== index));
    setResultDescriptions(prev => prev.filter((_, i) => i !== index));
    setMessage({ type: 'success', text: '已删除图片' });
    setTimeout(() => setMessage(null), 2000);
  };

  // 更新结果标题
  const handleUpdateTitle = (index: number, title: string) => {
    setResultTitles(prev => {
      const newTitles = [...prev];
      newTitles[index] = title;
      return newTitles;
    });
  };

  // 更新结果描述
  const handleUpdateDescription = (index: number, description: string) => {
    setResultDescriptions(prev => {
      const newDescriptions = [...prev];
      newDescriptions[index] = description;
      return newDescriptions;
    });
  };

  // 保存配置
  const handleSave = async () => {
    // 验证
    if (!configKey.trim()) {
      setMessage({ type: 'error', text: '请输入配置 Key' });
      return;
    }

    if (!configName.trim()) {
      setMessage({ type: 'error', text: '请输入配置名称' });
      return;
    }

    if (!gameTitle.trim()) {
      setMessage({ type: 'error', text: '请输入游戏标题' });
      return;
    }

    if (uploadedFiles.length < 2) {
      setMessage({ type: 'error', text: '至少需要上传 2 张图片' });
      return;
    }

    // 构建结果数组
    const results: TestResult[] = uploadedFiles.map((file, index) => ({
      id: String(index + 1),
      title: resultTitles[index] || '结果 ' + (index + 1),
      description: resultDescriptions[index] || '',
      image: file.url,
      imageType: 'url' as const,
      extra: {
        fileId: file.id,
        fileName: file.originalName,
        fileSize: file.size,
      },
    }));

    // 构建配置
    const config: SavedConfig = {
      id: configKey,  // 使用自定义的 key 作为 ID
      name: configName,
      description: (uploadedFiles.length) + ' 个结果',
      config: {
        gameTitle,
        gameDescription,
        buttonText,
        longPressDuration,
        results,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSaving(true);
    try {
      // 通过 API 保存
      const response = await fetch('/api/examples/test-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: config.id,
          name: config.name,
          description: config.description,
          config: config.config,
        }),
      });

      if (!response.ok) {
        throw new Error('保存失败');
      }

      setMessage({ type: 'success', text: '配置已保存！Key: ' + (configKey) });
      await loadConfigs();

      // 清空表单（可选）
      // resetForm();
    } catch (error) {
      console.error('保存失败:', error);
      setMessage({ type: 'error', text: '保存配置失败' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // 复制测试链接
  const handleCopyLink = () => {
    if (!configKey) {
      setMessage({ type: 'error', text: '请先输入配置 Key' });
      return;
    }

    const url = (window.location.origin) + '/test-yourself?configId=' + (configKey);
    navigator.clipboard.writeText(url);
    setMessage({ type: 'success', text: '链接已复制到剪贴板' });
    setTimeout(() => setMessage(null), 2000);
  };

  // 预览配置
  const handlePreview = () => {
    if (!configKey) {
      setMessage({ type: 'error', text: '请先保存配置' });
      return;
    }

    window.open('/test-yourself?configId=' + (configKey), '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                测测你是什么 - 简化配置
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                设置 Key，上传图片，快速创建测试配置
              </p>
            </div>
            
            {/* 存储方式标识 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">存储:</span>
              <span className={clsx('px-3 py-1 rounded-full text-sm font-medium', storageType === 'database' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300')}>
                {storageType === 'database' ? '🗄️ 数据库' : '💾 LocalStorage'}
              </span>
            </div>
          </div>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={clsx('mb-6 p-4 rounded-lg border', message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300')}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：配置表单 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📝 基本信息
              </h2>

              <div className="space-y-4">
                {/* 配置 Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    配置 Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={configKey}
                    onChange={(e) => setConfigKey(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="例: my-personality-test"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    只能包含小写字母、数字和连字符，用于 URL: /test-yourself?configId={configKey || 'key'}
                  </p>
                </div>

                {/* 配置名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    配置名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    placeholder="例: 性格测试"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* 游戏标题 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    游戏标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={gameTitle}
                    onChange={(e) => setGameTitle(e.target.value)}
                    placeholder="例: 你是什么性格？"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* 游戏描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    游戏描述
                  </label>
                  <input
                    type="text"
                    value={gameDescription}
                    onChange={(e) => setGameDescription(e.target.value)}
                    placeholder="例: 长按按钮，发现你的性格属性"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* 按钮文本 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      按钮文本
                    </label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      长按时长 (毫秒)
                    </label>
                    <input
                      type="number"
                      value={longPressDuration}
                      onChange={(e) => setLongPressDuration(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 图片上传区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🖼️ 上传结果图片
              </h2>

              {/* 上传按钮 */}
              <div className="mb-6">
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <UploadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      点击上传图片或拖拽到这里
                    </p>
                    <p className="text-sm text-gray-500">
                      支持 JPG、PNG、GIF、WebP 格式，每张图片对应一个测试结果
                    </p>
                    {uploading && (
                      <p className="text-blue-600 mt-2">上传中...</p>
                    )}
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* 已上传图片列表 */}
              {uploadedFiles.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    已上传 {uploadedFiles.length} 张图片
                  </p>

                  <div className="space-y-4">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={file.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex gap-4">
                          {/* 图片预览 */}
                          <div className="flex-shrink-0">
                            <img
                              src={file.url}
                              alt={file.originalName}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          </div>

                          {/* 结果信息 */}
                          <div className="flex-grow space-y-3">
                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                结果标题
                              </label>
                              <input
                                type="text"
                                value={resultTitles[index] || ''}
                                onChange={(e) => handleUpdateTitle(index, e.target.value)}
                                placeholder={'结果 ' + (index + 1)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                结果描述
                              </label>
                              <textarea
                                value={resultDescriptions[index] || ''}
                                onChange={(e) => handleUpdateDescription(index, e.target.value)}
                                placeholder="描述这个结果..."
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                              />
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{file.originalName}</span>
                              <span>{(file.size / 1024).toFixed(2)} KB</span>
                            </div>
                          </div>

                          {/* 删除按钮 */}
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => handleDeleteFile(index)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadedFiles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>还没有上传图片</p>
                  <p className="text-sm">至少上传 2 张图片才能创建配置</p>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || uploadedFiles.length < 2}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <Save className="w-5 h-5" />
                  {saving ? '保存中...' : '保存配置'}
                </button>

                <button
                  onClick={handleCopyLink}
                  disabled={!configKey}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Copy className="w-5 h-5" />
                  复制链接
                </button>

                <button
                  onClick={handlePreview}
                  disabled={!configKey}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  预览
                </button>
              </div>

              {/* 测试链接预览 */}
              {configKey && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">测试链接:</p>
                  <code className="text-sm text-blue-600 dark:text-blue-400 break-all">
                    /test-yourself?configId={configKey}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：已保存配置列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📋 已保存配置
              </h2>

              {savedConfigs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">还没有保存的配置</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {savedConfigs.map((config) => (
                    <div
                      key={config.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        // 加载配置到表单
                        setConfigKey(config.id);
                        setConfigName(config.name);
                        setGameTitle(config.config.gameTitle);
                        setGameDescription(config.config.gameDescription || '');
                        setButtonText(config.config.buttonText || '按住测试');
                        setLongPressDuration(config.config.longPressDuration || 3000);
                        
                        // 加载结果
                        setResultTitles(config.config.results.map(r => r.title));
                        setResultDescriptions(config.config.results.map(r => r.description));
                        setUploadedFiles(config.config.results.map((r, i) => ({
                          id: 'loaded-' + (i),
                          url: r.image,
                          originalName: r.title,
                          size: 0,
                        })));
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {config.name}
                        </h3>
                        {config.isDefault && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                            默认
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        Key: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{config.id}</code>
                      </p>
                      <p className="text-xs text-gray-500">
                        {config.config.results.length} 个结果
                      </p>
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open('/test-yourself?configId=' + (config.id), '_blank');
                          }}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          预览
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText('/test-yourself?configId=' + (config.id));
                            setMessage({ type: 'success', text: '链接已复制' });
                            setTimeout(() => setMessage(null), 2000);
                          }}
                          className="text-xs text-gray-600 hover:underline"
                        >
                          复制链接
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 使用说明
          </h2>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>
              <strong>1. 设置 Key：</strong>为配置设置一个唯一的 key，用于 URL 参数
            </p>
            <p>
              <strong>2. 上传图片：</strong>批量上传多张图片，每张图片对应一个测试结果
            </p>
            <p>
              <strong>3. 编辑结果：</strong>为每张图片设置标题和描述
            </p>
            <p>
              <strong>4. 保存配置：</strong>保存后即可通过链接访问测试
            </p>
            <p className="pt-2 border-t border-blue-200 dark:border-blue-700">
              <strong>测试链接格式：</strong>
              <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded ml-2">
                /test-yourself?configId=你的key
              </code>
            </p>
          </div>
        </div>

        {/* TODO: 集成 UniversalFile 上传组件 */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
            🚧 待集成：UniversalFile 上传组件
          </h2>
          <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
            <p>
              当前使用 Base64 临时方案。生产环境应该集成 UniversalFile 模块上传到 OSS：
            </p>
            <pre className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded mt-2 text-xs overflow-x-auto">
{`import { universalFileClient } from 'sa2kit/universalFile';

const metadata = await universalFileClient.uploadFile({
  file: uploadedFile,
  moduleId: 'test-yourself',
  businessId: configKey,
  permission: 'public',
});

// 使用 metadata.cdnUrl 作为图片 URL`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}








