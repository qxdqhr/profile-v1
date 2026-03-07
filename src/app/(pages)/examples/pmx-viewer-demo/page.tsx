'use client';

/**
 * PMX模型解析器演示页面
 * 展示如何使用PMXParser查看模型的纹理映射关系
 */

import React, { useState } from 'react';
import { PMXViewer } from 'sa2kit/mmd';
import { clsx } from 'clsx';

const CDN_BASE_PATH = 'https://cdn.qhr062.top';

// 预设的模型列表
const PRESET_MODELS = [
  {
    name: 'YYB Z6 樱花初音（CDN）',
    url: (CDN_BASE_PATH) + '/mmd/model/YYB_Z6SakuraMiku/miku.pmx',
    basePath: (CDN_BASE_PATH) + '/mmd/model/YYB_Z6SakuraMiku',
  },
  {
    name: 'Tda式改变初音（CDN）',
    url: (CDN_BASE_PATH) + '/mmd/model/Tda式改変初音ミク/Tda式改変初音ミク_デフォ服Ver1.10.pmx',
    basePath: (CDN_BASE_PATH) + '/mmd/model/Tda式改変初音ミク',
  },
  {
    name: 'yagi39mikuNT（CDN）',
    url: (CDN_BASE_PATH) + '/mmd/model/yagi39mikuNT/yagi39mikuNT.pmx',
    basePath: (CDN_BASE_PATH) + '/mmd/model/yagi39mikuNT',
  },
  {
    name: 'yagi39mikuNT（本地）',
    url: `/mmd/model/yagi39mikuNT/yagi39mikuNT`,
    basePath: `/mmd/model/yagi39mikuNT`,
  },
  {
    name: 'YYB樱花初音（本地）',
    url: `/mmd/model/YYB_Z6SakuraMiku/miku.pmx`,
    basePath: `/mmd/model/YYB_Z6SakuraMiku`,
  },
  {
    name: 'V4C初音短发（本地）',
    url: `/mmd/model/miku/v4c5.0short.pmx`,
    basePath: `/mmd/model/miku`,
  },
  {
    name: 'V4C初音长发（本地）',
    url: `/mmd/model/miku/v4c5.0.pmx`,
    basePath: `/mmd/model/miku`,
  },
  {
    name: 'Erusa人类（本地）',
    url: `/mmd/model/erusa/erusa-human.pmx`,
    basePath: `/mmd/model/erusa`,
  },
];

export default function PMXViewerDemoPage() {
  const [selectedModel, setSelectedModel] = useState(PRESET_MODELS[0]);
  const [customUrl, setCustomUrl] = useState('');
  const [customBasePath, setCustomBasePath] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUseCustom(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PMX模型解析器</h1>
              <p className="text-sm text-gray-600 mt-1">
                查看PMX模型文件的纹理映射关系
              </p>
            </div>
            <a
              href="/examples/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← 返回首页
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：模型选择器 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">选择模型</h2>
              
              {/* 预设模型 */}
              <div className="space-y-2 mb-6">
                <p className="text-sm font-medium text-gray-700">预设模型</p>
                {PRESET_MODELS.map((model) => (
                  <button
                    key={model.url}
                    onClick={() => {
                      setSelectedModel(model);
                      setUseCustom(false);
                    }}
                    className={clsx('w-full text-left px-4 py-3 rounded-lg border-2 transition-colors', !useCustom && selectedModel.url === model.url
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700')}
                  >
                    <p className="font-medium">{model.name}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {model.url}
                    </p>
                  </button>
                ))}
              </div>

              {/* 自定义URL */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">自定义模型</p>
                <form onSubmit={handleCustomSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      PMX文件URL
                    </label>
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      基础路径（可选）
                    </label>
                    <input
                      type="text"
                      value={customBasePath}
                      onChange={(e) => setCustomBasePath(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!customUrl}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    解析模型
                  </button>
                </form>
              </div>

              {/* 使用说明 */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  💡 使用说明
                </h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• 选择预设模型或输入自定义URL</li>
                  <li>• 查看模型的纹理映射关系</li>
                  <li>• 了解MMDLoader如何加载资源</li>
                  <li>• 基础路径用于拼接完整纹理URL</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 右侧：PMX查看器 */}
          <div className="lg:col-span-2">
            {useCustom ? (
              <PMXViewer
                key={customUrl}
                modelUrl={customUrl}
                basePath={customBasePath}
                onParsed={(result) => {
                  console.log('PMX解析结果:', result);
                }}
                onError={(error) => {
                  console.error('PMX解析错误:', error);
                }}
              />
            ) : (
              <PMXViewer
                key={selectedModel.url}
                modelUrl={selectedModel.url}
                basePath={selectedModel.basePath}
                onParsed={(result) => {
                  console.log('PMX解析结果:', result);
                }}
                onError={(error) => {
                  console.error('PMX解析错误:', error);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
