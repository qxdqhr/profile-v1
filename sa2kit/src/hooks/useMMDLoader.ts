/**
 * useMMDLoader Hook
 * 
 * A React hook for loading MMD models and animations
 * 
 * @module sa2kit/hooks/useMMDLoader
 * @author SA2Kit Team
 * @license MIT
 */

import { useState, useCallback, useRef } from 'react'
import * as THREE from 'three'
import { MMDLoader } from 'three-stdlib'

/**
 * Loading state type
 */
export interface MMDLoadState {
  loading: boolean
  progress: number
  error: Error | null
}

/**
 * Loaded resource type
 */
export interface MMDLoadedResource {
  model?: THREE.SkinnedMesh | THREE.Group
  motion?: any
  cameraMotion?: any
}

/**
 * useMMDLoader hook return type
 */
export interface UseMMDLoaderReturn {
  /** Loading state */
  loadState: MMDLoadState
  /** Loaded resources */
  resource: MMDLoadedResource
  /** Load model */
  loadModel: (path: string, onProgress?: (progress: number) => void) => Promise<THREE.SkinnedMesh | THREE.Group>
  /** Load motion (VMD) */
  loadMotion: (path: string, onProgress?: (progress: number) => void) => Promise<any>
  /** Load camera motion (VMD) */
  loadCameraMotion: (path: string, onProgress?: (progress: number) => void) => Promise<any>
  /** Reset loader */
  reset: () => void
}

/**
 * ========================================
 * useMMDLoader Hook
 * ========================================
 * 
 * A hook for loading MMD models and animations with progress tracking.
 * 
 * Features:
 * - Model loading with progress
 * - Motion (VMD) loading
 * - Camera motion loading
 * - Error handling
 * - Loading state management
 * 
 * @example
 * ```tsx
 * const { loadState, resource, loadModel, loadMotion } = useMMDLoader()
 * 
 * useEffect(() => {
 *   const load = async () => {
 *     try {
 *       const model = await loadModel('/models/miku.pmx')
 *       const motion = await loadMotion('/motions/dance.vmd')
 *       console.log('Loaded:', model, motion)
 *     } catch (error) {
 *       console.error('Loading failed:', error)
 *     }
 *   }
 *   load()
 * }, [])
 * ```
 */
export const useMMDLoader = (): UseMMDLoaderReturn => {
  // ========================================
  // State
  // ========================================
  const [loadState, setLoadState] = useState<MMDLoadState>({
    loading: false,
    progress: 0,
    error: null,
  })
  const [resource, setResource] = useState<MMDLoadedResource>({})

  // ========================================
  // Refs
  // ========================================
  const loaderRef = useRef<MMDLoader>(new MMDLoader())

  /**
   * Load model
   */
  const loadModel = useCallback(
    async (path: string, onProgress?: (progress: number) => void): Promise<THREE.SkinnedMesh | THREE.Group> => {
      try {
        setLoadState({ loading: true, progress: 0, error: null })

        const model = await loaderRef.current.loadAsync(
          path,
          (progressEvent) => {
            const percent = (progressEvent.loaded / progressEvent.total) * 100
            setLoadState(prev => ({ ...prev, progress: percent }))
            onProgress?.(percent)
          }
        )

        setLoadState({ loading: false, progress: 100, error: null })
        setResource(prev => ({ ...prev, model }))

        return model
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load model')
        setLoadState({ loading: false, progress: 0, error: err })
        throw err
      }
    },
    []
  )

  /**
   * Load motion
   */
  const loadMotion = useCallback(
    async (path: string, onProgress?: (progress: number) => void): Promise<any> => {
      try {
        setLoadState({ loading: true, progress: 0, error: null })

        const motion = await loaderRef.current.loadAsync(
          path,
          (progressEvent) => {
            const percent = (progressEvent.loaded / progressEvent.total) * 100
            setLoadState(prev => ({ ...prev, progress: percent }))
            onProgress?.(percent)
          }
        )

        setLoadState({ loading: false, progress: 100, error: null })
        setResource(prev => ({ ...prev, motion }))

        return motion
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load motion')
        setLoadState({ loading: false, progress: 0, error: err })
        throw err
      }
    },
    []
  )

  /**
   * Load camera motion
   */
  const loadCameraMotion = useCallback(
    async (path: string, onProgress?: (progress: number) => void): Promise<any> => {
      try {
        setLoadState({ loading: true, progress: 0, error: null })

        const cameraMotion = await loaderRef.current.loadAsync(
          path,
          (progressEvent) => {
            const percent = (progressEvent.loaded / progressEvent.total) * 100
            setLoadState(prev => ({ ...prev, progress: percent }))
            onProgress?.(percent)
          }
        )

        setLoadState({ loading: false, progress: 100, error: null })
        setResource(prev => ({ ...prev, cameraMotion }))

        return cameraMotion
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load camera motion')
        setLoadState({ loading: false, progress: 0, error: err })
        throw err
      }
    },
    []
  )

  /**
   * Reset loader
   */
  const reset = useCallback(() => {
    setLoadState({ loading: false, progress: 0, error: null })
    setResource({})
  }, [])

  return {
    loadState,
    resource,
    loadModel,
    loadMotion,
    loadCameraMotion,
    reset,
  }
}

export default useMMDLoader
