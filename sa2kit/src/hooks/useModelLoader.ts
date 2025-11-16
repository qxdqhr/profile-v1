/**
 * useModelLoader Hook
 * 
 * 简化的模型加载 Hook，提供状态管理和错误处理
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { LoadResult, ModelLoaderConfig } from '../utils/modelLoader'
import { getGlobalModelLoader } from '../utils/modelLoader'

/**
 * 加载状态
 */
export interface ModelLoadState {
  /** 是否正在加载 */
  loading: boolean
  /** 加载进度 (0-100) */
  progress: number
  /** 错误信息 */
  error: Error | null
  /** 加载结果 */
  result: LoadResult | null
}

/**
 * Hook 选项
 */
export interface UseModelLoaderOptions extends Omit<ModelLoaderConfig, 'onProgress'> {
  /** 是否自动加载 */
  autoLoad?: boolean
  /** 进度回调 */
  onProgress?: (progress: number) => void
  /** 加载完成回调 */
  onLoad?: (result: LoadResult) => void
  /** 错误回调 */
  onError?: (error: Error) => void
}

/**
 * Hook 返回值
 */
export interface UseModelLoaderReturn {
  /** 加载状态 */
  state: ModelLoadState
  /** 手动加载函数 */
  load: () => Promise<LoadResult | null>
  /** 重新加载函数 */
  reload: () => Promise<LoadResult | null>
  /** 清除缓存 */
  clearCache: () => void
}

/**
 * 模型加载 Hook
 * 
 * @example
 * ```tsx
 * const { state, load, reload } = useModelLoader({
 *   modelPath: '/models/miku.pmx',
 *   autoLoad: true,
 *   onProgress: (progress) => console.log(`${progress}%`),
 *   onLoad: (result) => console.log('加载完成', result),
 * })
 * 
 * return (
 *   <div>
 *     {state.loading && <p>加载中... {state.progress}%</p>}
 *     {state.error && <p>错误: {state.error.message}</p>}
 *     {state.result && <p>加载成功，耗时: {state.result.loadTime}ms</p>}
 *     <button onClick={reload}>重新加载</button>
 *   </div>
 * )
 * ```
 */
export function useModelLoader(options: UseModelLoaderOptions): UseModelLoaderReturn {
  const {
    modelPath,
    texturePath,
    modelFileName,
    debug,
    autoLoad = false,
    onProgress,
    onLoad,
    onError,
  } = options

  const [state, setState] = useState<ModelLoadState>({
    loading: false,
    progress: 0,
    error: null,
    result: null,
  })

  const loaderRef = useRef(getGlobalModelLoader({ debug }))
  const isLoadingRef = useRef(false)

  /**
   * 加载模型
   */
  const load = useCallback(async (): Promise<LoadResult | null> => {
    // 防止重复加载
    if (isLoadingRef.current) {
      console.warn('[useModelLoader] 已有加载任务进行中')
      return null
    }

    isLoadingRef.current = true
    setState((prev) => ({ ...prev, loading: true, progress: 0, error: null }))

    try {
      const result = await loaderRef.current.load({
        modelPath,
        texturePath,
        modelFileName,
        debug,
        onProgress: (progress) => {
          setState((prev) => ({ ...prev, progress }))
          onProgress?.(progress)
        },
      })

      setState({
        loading: false,
        progress: 100,
        error: null,
        result,
      })

      onLoad?.(result)
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error('加载失败')
      setState({
        loading: false,
        progress: 0,
        error: err,
        result: null,
      })
      onError?.(err)
      return null
    } finally {
      isLoadingRef.current = false
    }
  }, [modelPath, texturePath, modelFileName, debug, onProgress, onLoad, onError])

  /**
   * 重新加载（清除缓存后加载）
   */
  const reload = useCallback(async (): Promise<LoadResult | null> => {
    loaderRef.current.clearCache(modelPath)
    return load()
  }, [modelPath, load])

  /**
   * 清除缓存
   */
  const clearCache = useCallback(() => {
    loaderRef.current.clearCache(modelPath)
  }, [modelPath])

  /**
   * 自动加载
   */
  useEffect(() => {
    if (autoLoad && !state.result && !state.loading && !state.error) {
      load()
    }
  }, [autoLoad]) // 只在 autoLoad 变化时触发

  return {
    state,
    load,
    reload,
    clearCache,
  }
}

/**
 * 批量加载 Hook
 */
export interface UseBatchModelLoaderOptions {
  /** 模型配置列表 */
  models: ModelLoaderConfig[]
  /** 是否自动加载 */
  autoLoad?: boolean
  /** 总体进度回调 */
  onProgress?: (progress: number, current: number, total: number) => void
  /** 全部加载完成回调 */
  onComplete?: (results: (LoadResult | null)[]) => void
}

/**
 * 批量加载 Hook 返回值
 */
export interface UseBatchModelLoaderReturn {
  /** 是否正在加载 */
  loading: boolean
  /** 总体进度 */
  progress: number
  /** 当前加载索引 */
  currentIndex: number
  /** 加载结果列表 */
  results: (LoadResult | null)[]
  /** 错误列表 */
  errors: (Error | null)[]
  /** 开始加载 */
  load: () => Promise<void>
}

/**
 * 批量模型加载 Hook
 */
export function useBatchModelLoader(
  options: UseBatchModelLoaderOptions
): UseBatchModelLoaderReturn {
  const { models, autoLoad = false, onProgress, onComplete } = options

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<(LoadResult | null)[]>([])
  const [errors, setErrors] = useState<(Error | null)[]>([])

  const loaderRef = useRef(getGlobalModelLoader())

  const load = useCallback(async () => {
    setLoading(true)
    setProgress(0)
    setCurrentIndex(0)
    setResults([])
    setErrors([])

    const loadedResults: (LoadResult | null)[] = []
    const loadedErrors: (Error | null)[] = []

    for (let i = 0; i < models.length; i++) {
      setCurrentIndex(i)

      try {
        const result = await loaderRef.current.load({
          ...models[i],
          onProgress: (itemProgress) => {
            const overallProgress = ((i + itemProgress / 100) / models.length) * 100
            setProgress(overallProgress)
            onProgress?.(overallProgress, i, models.length)
          },
        })

        loadedResults.push(result)
        loadedErrors.push(null)
      } catch (error) {
        const err = error instanceof Error ? error : new Error('加载失败')
        loadedResults.push(null)
        loadedErrors.push(err)
      }
    }

    setResults(loadedResults)
    setErrors(loadedErrors)
    setProgress(100)
    setLoading(false)

    onComplete?.(loadedResults)
  }, [models, onProgress, onComplete])

  useEffect(() => {
    if (autoLoad && !loading && results.length === 0) {
      load()
    }
  }, [autoLoad]) // 只在 autoLoad 变化时触发

  return {
    loading,
    progress,
    currentIndex,
    results,
    errors,
    load,
  }
}

