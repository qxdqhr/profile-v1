'use client';

/**
 * PMX模型编辑器演示页面
 * 提供完整的PMX材质纹理绑定编辑功能
 */

import React, { useState } from 'react';
import { PMXEditor } from 'sa2kit/mmd';
import { clsx } from 'clsx';

const CDN_BASE_PATH = 'https://cdn.qhr062.top';

// 预设的模型列表
const PRESET_MODELS = [
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
    name: 'YYB Z6 樱花初音（CDN）',
    url: (CDN_BASE_PATH) + '/mmd/model/YYB_Z6SakuraMiku/miku.pmx',
    basePath: (CDN_BASE_PATH) + '/mmd/model/YYB_Z6SakuraMiku',
  },
];

export default function PMXEditorDemoPage() {
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
              <h1 className="text-2xl font-bold text-gray-900">PMX模型编辑器</h1>
              <p className="text-sm text-gray-600 mt-1">
                编辑材质纹理绑定关系，导出修改后的PMX文件
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
        {/* 模型选择器 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">选择要编辑的模型</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {PRESET_MODELS.map((model) => (
              <button
                key={model.url}
                onClick={() => {
                  setSelectedModel(model);
                  setUseCustom(false);
                }}
                className={clsx('text-left px-4 py-3 rounded-lg border-2 transition-colors', !useCustom && selectedModel.url === model.url
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
            <p className="text-sm font-medium text-gray-700 mb-3">或使用自定义模型</p>
            <form onSubmit={handleCustomSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="PMX文件URL"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={customBasePath}
                onChange={(e) => setCustomBasePath(e.target.value)}
                placeholder="基础路径（可选）"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!customUrl}
                className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                加载模型
              </button>
            </form>
          </div>
        </div>

        {/* PMX编辑器 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {useCustom ? (
            <PMXEditor
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
            <PMXEditor
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

        {/* 使用说明 */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">🎨 材质编辑</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>点击材质选择要编辑的对象</li>
                <li>通过下拉框修改纹理绑定</li>
                <li>支持主纹理、Sphere、Toon纹理</li>
                <li>实时预览绑定关系</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🖼️ 纹理管理</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>添加新的纹理文件路径</li>
                <li>删除未使用的纹理</li>
                <li>查看纹理使用情况</li>
                <li>优化资源占用</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📜 编辑历史</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>查看所有编辑操作</li>
                <li>追踪修改记录</li>
                <li>时间戳标记</li>
                <li>操作类型分类</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">💾 导出功能</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>导出修改后的PMX文件</li>
                <li>保留原始模型信息</li>
                <li>自动下载到本地</li>
                <li>支持在MMD中使用</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="mt-4 bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ 注意事项</h3>
          <ul className="space-y-2 text-sm text-yellow-800 list-disc list-inside">
            <li>导出的PMX文件不包含顶点和面数据（仅修改材质纹理绑定）</li>
            <li>建议在修改前备份原始PMX文件</li>
            <li>删除纹理前请确认没有材质在使用</li>
            <li>导出的文件名会自动添加 _edited 后缀</li>
            <li>修改仅在浏览器内存中进行，刷新页面会丢失</li>
          </ul>
        </div>
      </div>
    </div>
  );
}




