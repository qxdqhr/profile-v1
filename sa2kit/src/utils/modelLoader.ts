/**
 * MMD 模型加载器工具类
 * 
 * 提供统一的模型加载、缓存和管理功能
 */

import * as THREE from 'three'
import { MMDLoader } from 'three-stdlib'
import { TexturePathResolver } from './texturePathResolver'

/**
 * 加载进度回调
 */
export type LoadProgressCallback = (progress: number, loaded: number, total: number) => void

/**
 * 加载配置
 */
export interface ModelLoaderConfig {
  /** 模型文件路径 */
  modelPath: string
  /** 纹理基础路径（可选）*/
  texturePath?: string
  /** 模型文件名（如果 modelPath 是目录）*/
  modelFileName?: string
  /** 是否启用调试模式 */
  debug?: boolean
  /** 进度回调 */
  onProgress?: LoadProgressCallback
}

/**
 * 加载结果
 */
export interface LoadResult {
  /** 加载的模型 */
  model: THREE.SkinnedMesh | THREE.Group
  /** 加载耗时（毫秒）*/
  loadTime: number
  /** 模型大小信息 */
  size: {
    width: number
    height: number
    depth: number
  }
}

/**
 * 模型缓存项
 */
interface CacheItem {
  model: THREE.SkinnedMesh | THREE.Group
  timestamp: number
}

/**
 * MMD 模型加载器类
 */
export class ModelLoader {
  private cache: Map<string, CacheItem>
  private maxCacheSize: number
  private debug: boolean

  constructor(options: { maxCacheSize?: number; debug?: boolean } = {}) {
    this.cache = new Map()
    this.maxCacheSize = options.maxCacheSize || 10
    this.debug = options.debug || false
  }

  /**
   * 加载 MMD 模型
   */
  async load(config: ModelLoaderConfig): Promise<LoadResult> {
    const startTime = Date.now()
    const { modelPath, texturePath, modelFileName, debug = this.debug, onProgress } = config

    try {
      // 检查缓存
      const cacheKey = this.getCacheKey(config)
      if (this.cache.has(cacheKey)) {
        this.log('使用缓存的模型:', cacheKey)
        const cached = this.cache.get(cacheKey)!
        return this.createLoadResult(cached.model.clone(), startTime)
      }

      // 设置纹理路径解析
      const basePath = texturePath || modelPath.substring(0, modelPath.lastIndexOf('/'))
      const textureResolver = new TexturePathResolver({
        basePath,
        modelPath,
        debug,
      })

      const manager = new THREE.LoadingManager()
      manager.setURLModifier((url) => {
        const resolved = textureResolver.resolve(url)
        if (url !== resolved && debug) {
          this.log('纹理路径解析:', url, '->', resolved)
        }
        return resolved
      })

      const loader = new MMDLoader(manager)
      
      // 只为相对路径设置 resourcePath
      if (!basePath.startsWith('/') && !basePath.startsWith('http')) {
        loader.setResourcePath(basePath + '/')
      }

      // 构建完整模型路径
      const fullModelPath = modelFileName ? `${modelPath}/${modelFileName}` : modelPath
      this.log('开始加载模型:', fullModelPath)

      // 加载模型
      const model = await loader.loadAsync(fullModelPath, (progressEvent) => {
        if (onProgress) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100
          onProgress(progress, progressEvent.loaded, progressEvent.total)
        }
      })

      // 清理过期材质属性
      this.cleanupMaterials(model)

      // 缓存模型
      this.addToCache(cacheKey, model)

      const loadTime = Date.now() - startTime
      this.log(`模型加载完成，耗时: ${loadTime}ms`)

      return this.createLoadResult(model, startTime)
    } catch (error) {
      this.log('模型加载失败:', error)
      throw error
    }
  }

  /**
   * 预加载模型（不返回结果，只缓存）
   */
  async preload(config: ModelLoaderConfig): Promise<void> {
    await this.load(config)
  }

  /**
   * 清除缓存
   */
  clearCache(modelPath?: string): void {
    if (modelPath) {
      const keysToDelete: string[] = []
      for (const key of this.cache.keys()) {
        if (key.includes(modelPath)) {
          keysToDelete.push(key)
        }
      }
      keysToDelete.forEach((key) => this.cache.delete(key))
      this.log(`清除缓存: ${keysToDelete.length} 项`)
    } else {
      this.cache.clear()
      this.log('清除所有缓存')
    }
  }

  /**
   * 获取缓存大小
   */
  getCacheSize(): number {
    return this.cache.size
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(config: ModelLoaderConfig): string {
    const { modelPath, texturePath, modelFileName } = config
    return `${modelPath}|${texturePath || ''}|${modelFileName || ''}`
  }

  /**
   * 添加到缓存
   */
  private addToCache(key: string, model: THREE.SkinnedMesh | THREE.Group): void {
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxCacheSize) {
      let oldestKey: string | null = null
      let oldestTime = Infinity

      for (const [k, v] of this.cache.entries()) {
        if (v.timestamp < oldestTime) {
          oldestTime = v.timestamp
          oldestKey = k
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey)
        this.log('缓存已满，删除最旧项:', oldestKey)
      }
    }

    this.cache.set(key, {
      model: model.clone(),
      timestamp: Date.now(),
    })
    this.log('添加到缓存:', key)
  }

  /**
   * 清理材质中的过期属性
   */
  private cleanupMaterials(model: THREE.SkinnedMesh | THREE.Group): void {
    model.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((mat: any) => {
          const deprecatedProps = ['combine', 'reflectivity', 'refractionRatio']
          deprecatedProps.forEach((prop) => {
            if (prop in mat && mat[prop] !== undefined) {
              delete mat[prop]
            }
          })
        })
      }
    })
  }

  /**
   * 创建加载结果
   */
  private createLoadResult(
    model: THREE.SkinnedMesh | THREE.Group,
    startTime: number
  ): LoadResult {
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())

    return {
      model,
      loadTime: Date.now() - startTime,
      size: {
        width: size.x,
        height: size.y,
        depth: size.z,
      },
    }
  }

  /**
   * 调试日志
   */
  private log(...args: any[]): void {
    if (this.debug) {
      console.log('[ModelLoader]', ...args)
    }
  }

  /**
   * 释放资源
   */
  dispose(): void {
    this.cache.clear()
  }
}

/**
 * 全局单例模型加载器
 */
let globalLoader: ModelLoader | null = null

/**
 * 获取全局模型加载器
 */
export function getGlobalModelLoader(options?: { maxCacheSize?: number; debug?: boolean }): ModelLoader {
  if (!globalLoader) {
    globalLoader = new ModelLoader(options)
  }
  return globalLoader
}

/**
 * 快捷加载函数
 */
export async function loadModel(config: ModelLoaderConfig): Promise<LoadResult> {
  const loader = getGlobalModelLoader({ debug: config.debug })
  return loader.load(config)
}

/**
 * 快捷预加载函数
 */
export async function preloadModel(config: ModelLoaderConfig): Promise<void> {
  const loader = getGlobalModelLoader({ debug: config.debug })
  return loader.preload(config)
}

