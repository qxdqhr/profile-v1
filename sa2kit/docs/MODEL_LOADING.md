# SA2Kit 模型加载完整指南

本文档介绍 SA2Kit 中完整的 MMD 模型加载流程和最佳实践。

## 目录

- [快速开始](#快速开始)
- [使用 ModelLoader 类](#使用-modelloader-类)
- [使用 React Hooks](#使用-react-hooks)
- [批量加载模型](#批量加载模型)
- [高级用法](#高级用法)

---

## 快速开始

### 方式 1: 使用 MMDViewer 组件（推荐新手）

最简单的方式是直接使用 `MMDViewer` 组件：

```tsx
import { MMDViewer } from '@sa2kit'

function MyApp() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <MMDViewer
        modelPath="/models/miku.pmx"
        modelFileName=""
        onLoad={() => console.log('模型加载完成')}
        onProgress={(progress) => console.log(`加载进度: ${progress}%`)}
        onError={(error) => console.error('加载失败:', error)}
      />
    </div>
  )
}
```

### 方式 2: 使用 useModelLoader Hook（推荐进阶）

如果需要更精细的控制：

```tsx
import { useModelLoader } from '@sa2kit'

function MyApp() {
  const { state, load, reload } = useModelLoader({
    modelPath: '/models/miku.pmx',
    autoLoad: true,
    onProgress: (progress) => console.log(`${progress}%`),
  })

  return (
    <div>
      {state.loading && (
        <div>加载中... {state.progress.toFixed(1)}%</div>
      )}
      
      {state.error && (
        <div style={{ color: 'red' }}>
          加载失败: {state.error.message}
          <button onClick={reload}>重试</button>
        </div>
      )}
      
      {state.result && (
        <div>
          <p>✅ 加载成功！</p>
          <p>耗时: {state.result.loadTime}ms</p>
          <p>模型尺寸: {state.result.size.width.toFixed(2)} × 
             {state.result.size.height.toFixed(2)} × 
             {state.result.size.depth.toFixed(2)}</p>
        </div>
      )}
    </div>
  )
}
```

---

## 使用 ModelLoader 类

`ModelLoader` 是一个底层工具类，提供模型加载、缓存管理等功能。

### 基础用法

```typescript
import { ModelLoader } from '@sa2kit'

// 创建加载器实例
const loader = new ModelLoader({
  maxCacheSize: 10,  // 最多缓存 10 个模型
  debug: true,        // 启用调试日志
})

// 加载模型
async function loadMyModel() {
  try {
    const result = await loader.load({
      modelPath: '/models/miku.pmx',
      onProgress: (progress, loaded, total) => {
        console.log(`进度: ${progress.toFixed(1)}%`)
        console.log(`已加载: ${loaded} / ${total} 字节`)
      },
    })
    
    console.log('模型:', result.model)
    console.log('耗时:', result.loadTime, 'ms')
    console.log('尺寸:', result.size)
  } catch (error) {
    console.error('加载失败:', error)
  }
}
```

### 使用全局单例

推荐使用全局单例以共享缓存：

```typescript
import { getGlobalModelLoader } from '@sa2kit'

const loader = getGlobalModelLoader({ debug: true })

// 在应用的任何地方使用同一个加载器
const result = await loader.load({
  modelPath: '/models/miku.pmx',
})
```

### 快捷函数

最简单的方式：

```typescript
import { loadModel, preloadModel } from '@sa2kit'

// 直接加载
const result = await loadModel({
  modelPath: '/models/miku.pmx',
  debug: true,
})

// 预加载（只缓存，不返回结果）
await preloadModel({
  modelPath: '/models/luka.pmx',
})
```

### 缓存管理

```typescript
const loader = getGlobalModelLoader()

// 查看缓存大小
console.log('缓存项数:', loader.getCacheSize())

// 清除特定模型的缓存
loader.clearCache('/models/miku.pmx')

// 清除所有缓存
loader.clearCache()

// 释放所有资源
loader.dispose()
```

---

## 使用 React Hooks

### useModelLoader - 单个模型加载

```tsx
import { useModelLoader } from '@sa2kit'

function ModelViewer() {
  const { state, load, reload, clearCache } = useModelLoader({
    modelPath: '/models/miku.pmx',
    texturePath: '/models/miku',  // 可选：纹理路径
    modelFileName: '',             // 可选：模型文件名
    autoLoad: true,                // 自动加载
    debug: true,                   // 调试模式
    
    // 回调函数
    onProgress: (progress) => {
      console.log(`加载进度: ${progress}%`)
    },
    onLoad: (result) => {
      console.log('加载完成:', result)
    },
    onError: (error) => {
      console.error('加载失败:', error)
    },
  })

  return (
    <div>
      {/* 加载状态 */}
      {state.loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>加载中... {state.progress.toFixed(1)}%</p>
        </div>
      )}

      {/* 错误状态 */}
      {state.error && (
        <div className="error-message">
          <p>❌ {state.error.message}</p>
          <button onClick={reload}>重新加载</button>
        </div>
      )}

      {/* 成功状态 */}
      {state.result && (
        <div className="success-info">
          <p>✅ 模型加载成功</p>
          <p>耗时: {state.result.loadTime}ms</p>
          <button onClick={clearCache}>清除缓存</button>
          <button onClick={reload}>重新加载</button>
        </div>
      )}
    </div>
  )
}
```

### 手动控制加载

```tsx
function ManualLoader() {
  const { state, load } = useModelLoader({
    modelPath: '/models/miku.pmx',
    autoLoad: false,  // 不自动加载
  })

  return (
    <div>
      <button onClick={load} disabled={state.loading}>
        {state.loading ? '加载中...' : '加载模型'}
      </button>
      
      {state.result && <p>✅ 加载完成</p>}
    </div>
  )
}
```

---

## 批量加载模型

### useBatchModelLoader - 批量加载

```tsx
import { useBatchModelLoader } from '@sa2kit'

function BatchLoader() {
  const { loading, progress, currentIndex, results, errors, load } = 
    useBatchModelLoader({
      models: [
        { modelPath: '/models/miku.pmx' },
        { modelPath: '/models/luka.pmx' },
        { modelPath: '/models/rin.pmx' },
        { modelPath: '/models/len.pmx' },
      ],
      autoLoad: true,
      onProgress: (progress, current, total) => {
        console.log(`总进度: ${progress.toFixed(1)}%`)
        console.log(`当前: ${current + 1} / ${total}`)
      },
      onComplete: (results) => {
        const successful = results.filter(r => r !== null).length
        console.log(`成功加载 ${successful} 个模型`)
      },
    })

  return (
    <div>
      <h2>批量加载模型</h2>
      
      {loading && (
        <div>
          <p>加载中... {progress.toFixed(1)}%</p>
          <p>当前: {currentIndex + 1} / 4</p>
        </div>
      )}

      {!loading && (
        <div>
          <h3>加载结果:</h3>
          {results.map((result, index) => (
            <div key={index}>
              {result ? (
                <p>✅ 模型 {index + 1}: 成功 ({result.loadTime}ms)</p>
              ) : (
                <p>❌ 模型 {index + 1}: 失败 ({errors[index]?.message})</p>
              )}
            </div>
          ))}
          <button onClick={load}>重新加载</button>
        </div>
      )}
    </div>
  )
}
```

---

## 高级用法

### 预加载策略

在用户可能访问页面前预加载模型：

```tsx
import { preloadModel } from '@sa2kit'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // 在后台预加载模型
    const preloadModels = async () => {
      try {
        await Promise.all([
          preloadModel({ modelPath: '/models/miku.pmx' }),
          preloadModel({ modelPath: '/models/luka.pmx' }),
        ])
        console.log('预加载完成')
      } catch (error) {
        console.error('预加载失败:', error)
      }
    }
    
    preloadModels()
  }, [])

  return <YourApp />
}
```

### 自定义进度显示

```tsx
function CustomProgressBar() {
  const { state } = useModelLoader({
    modelPath: '/models/miku.pmx',
    autoLoad: true,
  })

  return (
    <div className="progress-container">
      <div 
        className="progress-bar"
        style={{ width: `${state.progress}%` }}
      />
      <span>{state.progress.toFixed(0)}%</span>
    </div>
  )
}
```

### 错误重试机制

```tsx
function RetryLoader() {
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  const { state, load } = useModelLoader({
    modelPath: '/models/miku.pmx',
    autoLoad: true,
    onError: async (error) => {
      if (retryCount < maxRetries) {
        console.log(`加载失败，${retryCount + 1}/${maxRetries} 次重试...`)
        setRetryCount(prev => prev + 1)
        
        // 等待 2 秒后重试
        await new Promise(resolve => setTimeout(resolve, 2000))
        load()
      }
    },
  })

  return (
    <div>
      {state.error && retryCount >= maxRetries && (
        <p>❌ 加载失败，已达到最大重试次数</p>
      )}
    </div>
  )
}
```

### 性能监控

```tsx
function PerformanceMonitor() {
  const { state } = useModelLoader({
    modelPath: '/models/miku.pmx',
    autoLoad: true,
    onLoad: (result) => {
      // 发送性能指标到分析服务
      analytics.track('model_loaded', {
        modelPath: '/models/miku.pmx',
        loadTime: result.loadTime,
        modelSize: result.size,
        timestamp: Date.now(),
      })
    },
  })

  return <div>{/* 你的 UI */}</div>
}
```

---

## 最佳实践

### 1. 使用全局加载器

```typescript
// utils/modelLoader.ts
import { getGlobalModelLoader } from '@sa2kit'

export const appModelLoader = getGlobalModelLoader({
  maxCacheSize: 20,
  debug: process.env.NODE_ENV === 'development',
})
```

### 2. 集中管理模型路径

```typescript
// constants/models.ts
export const MODEL_PATHS = {
  MIKU: '/models/miku.pmx',
  LUKA: '/models/luka.pmx',
  RIN: '/models/rin.pmx',
  LEN: '/models/len.pmx',
} as const

// 使用
import { MODEL_PATHS } from '@/constants/models'

const { state } = useModelLoader({
  modelPath: MODEL_PATHS.MIKU,
})
```

### 3. 错误边界

```tsx
import { ErrorBoundary } from 'react-error-boundary'

function App() {
  return (
    <ErrorBoundary
      fallback={<div>模型加载失败，请刷新页面重试</div>}
      onError={(error) => console.error('Error:', error)}
    >
      <ModelViewer />
    </ErrorBoundary>
  )
}
```

### 4. 响应式加载

```tsx
function ResponsiveLoader() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  const { state } = useModelLoader({
    modelPath: isMobile 
      ? '/models/miku-low.pmx'  // 移动端使用低模
      : '/models/miku.pmx',      // 桌面端使用高模
    autoLoad: true,
  })

  return <div>{/* ... */}</div>
}
```

---

## API 参考

### ModelLoaderConfig

```typescript
interface ModelLoaderConfig {
  modelPath: string          // 模型文件路径
  texturePath?: string       // 纹理基础路径
  modelFileName?: string     // 模型文件名
  debug?: boolean           // 调试模式
  onProgress?: (            // 进度回调
    progress: number,       // 进度百分比 (0-100)
    loaded: number,         // 已加载字节数
    total: number          // 总字节数
  ) => void
}
```

### LoadResult

```typescript
interface LoadResult {
  model: THREE.SkinnedMesh | THREE.Group  // 加载的模型
  loadTime: number                         // 加载耗时(ms)
  size: {                                  // 模型尺寸
    width: number
    height: number
    depth: number
  }
}
```

---

## 故障排查

### 问题 1: 模型加载 404

**原因**: 路径不正确或文件不存在

**解决**:
1. 检查 `modelPath` 是否正确
2. 确保模型文件在 `public` 目录下
3. 检查浏览器 Network 标签查看实际请求的 URL

### 问题 2: 无限循环加载

**原因**: React 组件依赖项配置错误

**解决**: 使用 SA2Kit 提供的 Hooks，它们已经正确处理了依赖项

### 问题 3: 内存泄漏

**原因**: 未正确清理模型资源

**解决**:
```tsx
useEffect(() => {
  const loader = getGlobalModelLoader()
  
  return () => {
    // 组件卸载时清理
    loader.clearCache()
    loader.dispose()
  }
}, [])
```

---

## 更多资源

- [SA2Kit 官方文档](../README.md)
- [Three.js MMDLoader 文档](https://threejs.org/docs/#examples/en/loaders/MMDLoader)
- [示例代码](../examples)

