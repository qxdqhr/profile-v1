/**
 * ModelLoader 使用示例
 * 
 * 展示如何使用 SA2Kit 的模型加载封装
 */

import React, { useState } from 'react'
import { useModelLoader, useBatchModelLoader } from 'sa2kit'

/**
 * 示例 1: 基础模型加载
 */
export function BasicModelLoaderExample() {
  const { state, load, reload, clearCache } = useModelLoader({
    modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
    modelFileName: '',
    autoLoad: true,
    debug: true,
    onProgress: (progress) => {
      console.log(`🔄 加载进度: ${progress.toFixed(1)}%`)
    },
    onLoad: (result) => {
      console.log('✅ 模型加载完成!')
      console.log('  - 耗时:', result.loadTime, 'ms')
      console.log('  - 尺寸:', result.size)
    },
    onError: (error) => {
      console.error('❌ 加载失败:', error)
    },
  })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">基础模型加载示例</h2>

      {/* 加载状态 */}
      {state.loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-800 font-medium">加载中...</span>
            <span className="text-blue-600">{state.progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-red-800 font-semibold mb-2">❌ 加载失败</h3>
          <p className="text-red-600 text-sm mb-3">{state.error.message}</p>
          <button
            onClick={reload}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            重新加载
          </button>
        </div>
      )}

      {/* 成功状态 */}
      {state.result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h3 className="text-green-800 font-semibold mb-3">✅ 加载成功</h3>
          <div className="space-y-2 text-sm text-green-700">
            <p>⏱️ 加载耗时: <strong>{state.result.loadTime}ms</strong></p>
            <p>📐 模型尺寸:</p>
            <ul className="ml-6 list-disc">
              <li>宽: {state.result.size.width.toFixed(2)}</li>
              <li>高: {state.result.size.height.toFixed(2)}</li>
              <li>深: {state.result.size.depth.toFixed(2)}</li>
            </ul>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={load}
          disabled={state.loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          加载模型
        </button>
        <button
          onClick={reload}
          disabled={state.loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
        >
          重新加载
        </button>
        <button
          onClick={clearCache}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          清除缓存
        </button>
      </div>
    </div>
  )
}

/**
 * 示例 2: 批量模型加载
 */
export function BatchModelLoaderExample() {
  const models = [
    { modelPath: '/models/miku.pmx', modelFileName: '' },
    { modelPath: '/models/luka.pmx', modelFileName: '' },
    { modelPath: '/models/rin.pmx', modelFileName: '' },
    { modelPath: '/models/len.pmx', modelFileName: '' },
  ]

  const { loading, progress, currentIndex, results, errors, load } = useBatchModelLoader({
    models,
    autoLoad: false,
    onProgress: (progress, current, total) => {
      console.log(`📊 总进度: ${progress.toFixed(1)}% (${current + 1}/${total})`)
    },
    onComplete: (results) => {
      const successful = results.filter((r) => r !== null).length
      console.log(`🎉 完成！成功加载 ${successful}/${results.length} 个模型`)
    },
  })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">批量模型加载示例</h2>

      {/* 总体进度 */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-800 font-medium">
              批量加载中... ({currentIndex + 1}/{models.length})
            </span>
            <span className="text-blue-600">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 加载结果 */}
      {!loading && results.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3">加载结果:</h3>
          <div className="space-y-2">
            {models.map((model, index) => {
              const result = results[index]
              const error = errors[index]

              return (
                <div
                  key={index}
                  className={`p-3 rounded ${
                    result
                      ? 'bg-green-100 border border-green-200'
                      : 'bg-red-100 border border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {result ? '✅' : '❌'} 模型 {index + 1}
                    </span>
                    {result && (
                      <span className="text-sm text-gray-600">
                        {result.loadTime}ms
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{model.modelPath}</p>
                  {error && (
                    <p className="text-sm text-red-600 mt-1">{error.message}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <button
        onClick={load}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
      >
        {loading ? '加载中...' : '开始批量加载'}
      </button>
    </div>
  )
}

/**
 * 示例 3: 手动控制加载
 */
export function ManualModelLoaderExample() {
  const [modelPath, setModelPath] = useState('/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx')

  const { state, load } = useModelLoader({
    modelPath,
    modelFileName: '',
    autoLoad: false, // 不自动加载
    debug: true,
  })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">手动控制加载示例</h2>

      {/* 模型路径输入 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          模型路径:
        </label>
        <input
          type="text"
          value={modelPath}
          onChange={(e) => setModelPath(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="/models/miku.pmx"
        />
      </div>

      {/* 加载按钮 */}
      <button
        onClick={load}
        disabled={state.loading}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 font-medium"
      >
        {state.loading ? `加载中 ${state.progress.toFixed(0)}%` : '加载模型'}
      </button>

      {/* 状态显示 */}
      {state.result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">✅ 加载成功!</p>
        </div>
      )}

      {state.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-semibold">❌ {state.error.message}</p>
        </div>
      )}
    </div>
  )
}

/**
 * 示例 4: 带重试机制的加载
 */
export function RetryModelLoaderExample() {
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  const { state, load } = useModelLoader({
    modelPath: '/models/miku.pmx',
    autoLoad: true,
    onError: async (error) => {
      if (retryCount < maxRetries) {
        console.log(`❌ 加载失败，进行第 ${retryCount + 1}/${maxRetries} 次重试...`)
        setRetryCount((prev) => prev + 1)

        // 等待 2 秒后重试
        await new Promise((resolve) => setTimeout(resolve, 2000))
        load()
      } else {
        console.error(`💀 已达到最大重试次数，加载失败`)
      }
    },
    onLoad: () => {
      setRetryCount(0) // 成功后重置重试计数
    },
  })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">带重试机制的加载示例</h2>

      {state.loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            加载中... {retryCount > 0 && `(重试 ${retryCount}/${maxRetries})`}
          </p>
        </div>
      )}

      {state.error && retryCount >= maxRetries && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">❌ 加载失败</p>
          <p className="text-red-600 text-sm mt-2">
            已达到最大重试次数 ({maxRetries} 次)
          </p>
          <button
            onClick={() => {
              setRetryCount(0)
              load()
            }}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            重新开始
          </button>
        </div>
      )}

      {state.result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">✅ 加载成功!</p>
          {retryCount > 0 && (
            <p className="text-green-600 text-sm mt-1">
              经过 {retryCount} 次重试后成功
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 示例 5: 完整应用示例
 */
export function ComprehensiveExample() {
  const [selectedTab, setSelectedTab] = useState<string>('basic')

  const tabs = [
    { id: 'basic', label: '基础加载', component: BasicModelLoaderExample },
    { id: 'batch', label: '批量加载', component: BatchModelLoaderExample },
    { id: 'manual', label: '手动控制', component: ManualModelLoaderExample },
    { id: 'retry', label: '重试机制', component: RetryModelLoaderExample },
  ]

  const ActiveComponent = tabs.find((tab) => tab.id === selectedTab)?.component || BasicModelLoaderExample

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            SA2Kit 模型加载示例集合
          </h1>
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8">
        <ActiveComponent />
      </div>
    </div>
  )
}

export default ComprehensiveExample

