/**
 * 测测你是什么 - 配置管理示例页面
 * Test Yourself - Admin Example Page
 * 
 * 功能：
 * - 支持数据库存储和 localStorage 存储
 * - 自动根据环境选择存储方式
 * - 配置管理和列表查看
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ConfigManager, ConfigList } from 'sa2kit/testYourself/admin';
import { createConfigService } from 'sa2kit/testYourself/server';
import { clsx } from 'clsx';

export default function TestYourselfAdminPage() {
  const [activeTab, setActiveTab] = useState<'manage' | 'list'>('manage');
  const [storageType, setStorageType] = useState<string>('loading');
  const [configService] = useState(() => {
    // 创建配置服务（使用 localStorage）
    return createConfigService({
      storageType: 'localStorage',
      enableCache: true,
    });
  });

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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                测测你是什么 - 配置管理
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                创建和管理多套测试配置，支持图片上传、导入导出等功能
              </p>
            </div>
            
            {/* 存储类型标识 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">存储方式:</span>
              <span className={clsx('px-3 py-1 rounded-full text-sm font-medium', storageType === 'database' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : storageType === 'localStorage'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300')}>
                {storageType === 'database' && '🗄️ 数据库'}
                {storageType === 'localStorage' && '💾 LocalStorage'}
                {storageType === 'memory' && '🧠 内存'}
                {storageType === 'loading' && '⏳ 检测中...'}
              </span>
            </div>
          </div>
        </div>

        {/* 提示信息 */}
        {storageType === 'localStorage' && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                  当前使用 LocalStorage 存储
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  配置数据保存在浏览器本地。如需跨设备同步和多用户支持，请配置数据库。
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                  设置环境变量 <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">DATABASE_URL</code> 即可启用数据库存储
                </p>
              </div>
            </div>
          </div>
        )}

        {storageType === 'database' && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                  数据库存储已启用
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  配置数据已保存到数据库，支持跨设备同步、多租户、版本控制等企业级功能。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 标签页 */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('manage')}
                className={clsx('py-4 px-1 border-b-2 font-medium text-sm transition-colors', activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300')}
              >
                配置管理
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={clsx('py-4 px-1 border-b-2 font-medium text-sm transition-colors', activeTab === 'list'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300')}
              >
                配置列表
              </button>
            </nav>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {activeTab === 'manage' ? (
            <ConfigManager
              configService={configService}
              onConfigChange={(configs) => {
                console.log('配置已更新:', configs);
              }}
              onImageUpload={async (file) => {
                // 演示：使用 Base64（实际项目中应上传到服务器或 OSS）
                return new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    resolve(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                });
              }}
            />
          ) : (
            <div className="p-6">
              <ConfigList
                configService={configService}
                onSelect={(id) => {
                  console.log('选择配置:', id);
                  window.open('/test-yourself?configId=' + (id), '_blank');
                }}
                onEdit={(id) => {
                  console.log('编辑配置:', id);
                  setActiveTab('manage');
                }}
                onDelete={(id) => {
                  console.log('删除配置:', id);
                }}
                showActions={true}
                showPreviewLink={true}
                previewBaseUrl="/test-yourself"
              />
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 使用说明
          </h2>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>
              <strong>配置管理：</strong>创建、编辑和管理测试配置，支持添加多个结果项
            </p>
            <p>
              <strong>配置列表：</strong>查看所有配置，可以预览、导出或删除配置
            </p>
            <p>
              <strong>使用配置：</strong>访问{' '}
              <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">
                /test-yourself?configId=配置ID
              </code>{' '}
              使用特定配置
            </p>
            <p>
              <strong>默认配置：</strong>访问{' '}
              <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">
                /test-yourself
              </code>{' '}
              使用默认配置
            </p>
          </div>
        </div>

        {/* 数据库集成说明 */}
        {storageType === 'localStorage' && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              🔧 启用数据库存储
            </h2>
            <div className="space-y-3 text-sm text-gray-300">
              <p>当前使用 localStorage 存储。要启用数据库存储，请按以下步骤操作：</p>
              
              <div className="bg-gray-900 rounded p-4 space-y-2">
                <p className="text-gray-400"># 1. 安装依赖</p>
                <code className="text-green-400">pnpm add drizzle-orm postgres</code>
                
                <p className="text-gray-400 mt-3"># 2. 配置环境变量</p>
                <code className="text-yellow-400">DATABASE_URL=postgresql://user:password@localhost:5432/dbname</code>
                
                <p className="text-gray-400 mt-3"># 3. 执行数据库迁移</p>
                <code className="text-blue-400">psql $DATABASE_URL -f src/testYourself/server/migrations/001_create_tables.sql</code>
                
                <p className="text-gray-400 mt-3"># 4. 重启应用</p>
                <code className="text-pink-400">pnpm dev</code>
              </div>
              
              <p className="text-xs text-gray-400 mt-2">
                查看完整文档：
                <a 
                  href="https://github.com/your-repo/sa2kit/blob/main/src/testYourself/DATABASE_INTEGRATION_GUIDE.md"
                  className="text-blue-400 hover:underline ml-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DATABASE_INTEGRATION_GUIDE.md
                </a>
              </p>
            </div>
          </div>
        )}

        {/* 代码示例 */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-white mb-3">📝 代码示例</h2>
          <pre className="text-sm text-gray-300">
            <code>{`// 1. 在页面中使用 TestYourself 组件
import { TestYourself } from 'sa2kit/testYourself';

function TestPage() {
  const searchParams = useSearchParams();
  const configId = searchParams.get('configId');
  
  return (
    <TestYourself 
      configId={configId || undefined}
      onResult={(result) => {
        console.log('测试结果:', result);
      }}
    />
  );
}

// 2. 创建配置管理页面
import { ConfigManager, createConfigService } from 'sa2kit/testYourself';

const configService = createConfigService();

function AdminPage() {
  return <ConfigManager configService={configService} />;
}

// 3. 使用数据库存储（自动检测）
import { getConfigService } from '@/lib/test-config-service';

const { configService, storageType } = getConfigService();
console.log('存储方式:', storageType); // 'database' | 'localStorage' | 'memory'`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}









