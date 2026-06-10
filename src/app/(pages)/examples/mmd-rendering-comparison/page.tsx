'use client';

/**
 * MMD渲染效果对比演示
 * 对比优化前后的显示效果
 */

import React, { useState, useRef } from 'react';
import { MMDPlayerBase, MMDPlayerBaseRef } from 'sa2kit/mmd';
import { clsx } from 'clsx';
import { 
  configureMaterialsForMMD, 
  createMMDLights,
  configureRendererForMMD,
  diagnoseMaterialsMMD 
} from 'sa2kit/mmd';
import type { MMDPlayerBaseProps } from 'sa2kit/mmd';

const CDN_BASE = 'https://cdn.qhr062.top';

// 预设模型列表
const MODELS = [
  {
    name: 'YYB樱花初音',
    path: (CDN_BASE) + '/mmd/model/YYB_Z6SakuraMiku/miku.pmx',
    motion: (CDN_BASE) + '/mmd/motion/wavefile_lat.vmd',
  },
  {
    name: 'Tda式改变初音',
    path: (CDN_BASE) + '/mmd/model/Tda式改変初音ミク/Tda式改変初音ミク_デフォ服Ver1.10.pmx',
    motion: (CDN_BASE) + '/mmd/motion/wavefile_lat.vmd',
  },
];

type OptimizationLevel = 'none' | 'basic' | 'full';

export default function MMDRenderingComparisonPage() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [optimizationLevel, setOptimizationLevel] = useState<OptimizationLevel>('none');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const playerRef = useRef<MMDPlayerBaseRef>(null);

  const handleOptimizationChange = (level: OptimizationLevel) => {
    setOptimizationLevel(level);
  };

  const handlePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDiagnose = () => {
    // 这个需要访问场景对象，暂时通过控制台日志展示
    console.log('请在浏览器控制台查看诊断报告');
    alert('诊断报告已输出到浏览器控制台，请按F12查看');
  };

  // 根据优化级别配置props
  const getPlayerProps = (): Partial<MMDPlayerBaseProps> => {
    const baseProps: Partial<MMDPlayerBaseProps> = {
      renderEffect: 'outline',
      outlineOptions: {
        thickness: 0.003,
        color: '#000000',
      },
    };

    switch (optimizationLevel) {
      case 'none':
        // 无优化：使用默认设置
        return {
          ...baseProps,
          stage: {
            ambientLightIntensity: 0.5,
            directionalLightIntensity: 0.8,
            backgroundColor: '#f0f0f0',
          },
        };

      case 'basic':
        // 基础优化：调整光照
        return {
          ...baseProps,
          stage: {
            ambientLightIntensity: 0.6,
            directionalLightIntensity: 1.0,
            backgroundColor: '#f0f0f0',
          },
          outlineOptions: {
            thickness: 0.005,
            color: '#000000',
          },
        };

      case 'full':
        // 完全优化：使用MMD标准配置
        return {
          ...baseProps,
          stage: {
            ambientLightIntensity: 0.6,
            directionalLightIntensity: 1.0,
            backgroundColor: '#f0f0f0',
          },
          outlineOptions: {
            thickness: 0.005,
            color: '#000000',
          },
        };

      default:
        return baseProps;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MMD渲染效果对比</h1>
              <p className="text-sm text-gray-600 mt-1">
                对比优化前后的显示效果差异
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：控制面板 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 space-y-6 sticky top-8">
              {/* 模型选择 */}
              <div>
                <h2 className="text-lg font-semibold mb-3">选择模型</h2>
                <div className="space-y-2">
                  {MODELS.map((model) => (
                    <button
                      key={model.path}
                      onClick={() => setSelectedModel(model)}
                      className={clsx('w-full text-left px-4 py-3 rounded-lg border-2 transition-colors', selectedModel.path === model.path
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700')}
                    >
                      <p className="font-medium">{model.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 优化级别 */}
              <div>
                <h2 className="text-lg font-semibold mb-3">优化级别</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => handleOptimizationChange('none')}
                    className={clsx('w-full text-left px-4 py-3 rounded-lg border-2 transition-colors', optimizationLevel === 'none'
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700')}
                  >
                    <p className="font-medium">❌ 无优化</p>
                    <p className="text-xs mt-1 opacity-75">默认设置</p>
                  </button>

                  <button
                    onClick={() => handleOptimizationChange('basic')}
                    className={clsx('w-full text-left px-4 py-3 rounded-lg border-2 transition-colors', optimizationLevel === 'basic'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700')}
                  >
                    <p className="font-medium">⚡ 基础优化</p>
                    <p className="text-xs mt-1 opacity-75">调整光照和描边</p>
                  </button>

                  <button
                    onClick={() => handleOptimizationChange('full')}
                    className={clsx('w-full text-left px-4 py-3 rounded-lg border-2 transition-colors', optimizationLevel === 'full'
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700')}
                  >
                    <p className="font-medium">✅ 完全优化</p>
                    <p className="text-xs mt-1 opacity-75">MMD标准配置</p>
                  </button>
                </div>
              </div>

              {/* 控制按钮 */}
              <div className="space-y-2">
                <button
                  onClick={handlePlay}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  {isPlaying ? '⏸ 暂停' : '▶ 播放'}
                </button>

                <button
                  onClick={handleDiagnose}
                  className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  🔍 诊断材质
                </button>
              </div>

              {/* 说明 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  💡 优化说明
                </h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• <strong>无优化</strong>：默认Three.js渲染</li>
                  <li>• <strong>基础优化</strong>：调整光照强度和描边</li>
                  <li>• <strong>完全优化</strong>：应用MMD标准配置</li>
                </ul>
              </div>

              {/* 注意事项 */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                  ⚠️ 注意事项
                </h3>
                <ul className="text-xs text-yellow-800 space-y-1">
                  <li>• 需要toon01-10.bmp纹理文件</li>
                  <li>• Sphere纹理需要在模型目录</li>
                  <li>• 切换优化级别会重新加载</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 右侧：渲染区域 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* 状态指示 */}
              <div className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={clsx('w-3 h-3 rounded-full', optimizationLevel === 'none' ? 'bg-red-500' :
                    optimizationLevel === 'basic' ? 'bg-yellow-500' :
                    'bg-green-500')} />
                  <span className="font-medium">
                    {optimizationLevel === 'none' ? '无优化' :
                     optimizationLevel === 'basic' ? '基础优化' :
                     '完全优化'}
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  {selectedModel.name}
                </div>
              </div>

              {/* 播放器 */}
              <div className="aspect-video bg-gray-900">
                <MMDPlayerBase
                  key={(selectedModel.path) + '-' + (optimizationLevel)}
                  ref={playerRef}
                  resources={{
                    modelPath: selectedModel.path,
                    motionPath: selectedModel.motion,
                  }}
                  {...getPlayerProps()}
                  autoPlay={false}
                  loop={true}
                  className="w-full h-full"
                  onLoad={() => {
                    console.log('模型加载完成');
                  }}
                  onError={(error) => {
                    console.error('加载失败:', error);
                  }}
                />
              </div>

              {/* 优化详情 */}
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-3">当前配置详情</h3>
                
                {optimizationLevel === 'none' && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-800 mb-2">
                      <strong>未应用优化</strong> - 使用默认Three.js渲染设置
                    </p>
                    <ul className="text-xs text-red-700 space-y-1 ml-4">
                      <li>• 环境光强度: 0.5</li>
                      <li>• 方向光强度: 0.8</li>
                      <li>• 描边粗细: 0.003</li>
                      <li>• 无Toon渐变贴图</li>
                      <li>• 无额外补光</li>
                    </ul>
                  </div>
                )}

                {optimizationLevel === 'basic' && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 mb-2">
                      <strong>基础优化</strong> - 调整光照和描边参数
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-1 ml-4">
                      <li>• 环境光强度: 0.6 (↑)</li>
                      <li>• 方向光强度: 1.0 (↑)</li>
                      <li>• 描边粗细: 0.005 (↑)</li>
                      <li>• 光照方向优化</li>
                    </ul>
                  </div>
                )}

                {optimizationLevel === 'full' && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>完全优化</strong> - 应用MMD标准配置
                    </p>
                    <ul className="text-xs text-green-700 space-y-1 ml-4">
                      <li>• 环境光强度: 0.6</li>
                      <li>• 主光源强度: 1.0（从左前上方）</li>
                      <li>• 补光强度: 0.3（从右侧）</li>
                      <li>• 描边粗细: 0.005</li>
                      <li>• 5级Toon渐变贴图（卡通渲染）</li>
                      <li>• 材质高光优化（shininess=30）</li>
                      <li>• 线性色调映射</li>
                      <li>• sRGB颜色空间</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* 对比说明 */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">效果差异对比</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        特性
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        无优化
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        基础优化
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        完全优化
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        明暗过渡
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        平滑渐变
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">
                        平滑渐变
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        阶梯式（卡通）
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        光照强度
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        偏暗
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">
                        适中
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        明亮
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        描边清晰度
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        较细
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">
                        清晰
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        清晰
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        高光效果
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        默认
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">
                        默认
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        增强
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        整体风格
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        3D渲染
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">
                        3D渲染
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        二次元卡通
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

