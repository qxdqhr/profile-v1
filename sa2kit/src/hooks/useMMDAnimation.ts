/**
 * useMMDAnimation Hook
 * 
 * A React hook for managing MMD animation playback
 * 
 * @module sa2kit/hooks/useMMDAnimation
 * @author SA2Kit Team
 * @license MIT
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { MMDAnimationHelper } from 'three-stdlib'

/**
 * Animation state type
 */
export interface MMDAnimationState {
  /** Is playing */
  isPlaying: boolean
  /** Current progress (0-1) */
  progress: number
  /** Duration in seconds */
  duration: number
  /** Is looping */
  isLooping: boolean
}

/**
 * Animation options
 */
export interface MMDAnimationOptions {
  /** Enable physics */
  enablePhysics?: boolean
  /** Enable IK */
  enableIK?: boolean
  /** Enable Grant */
  enableGrant?: boolean
  /** Loop playback */
  loop?: boolean
}

/**
 * useMMDAnimation hook return type
 */
export interface UseMMDAnimationReturn {
  /** Animation state */
  state: MMDAnimationState
  /** Play animation */
  play: () => void
  /** Pause animation */
  pause: () => void
  /** Stop animation */
  stop: () => void
  /** Seek to time (seconds) */
  seek: (time: number) => void
  /** Set loop */
  setLoop: (loop: boolean) => void
  /** Update (call in animation loop) */
  update: (delta: number) => void
  /** Animation helper reference */
  helperRef: React.RefObject<MMDAnimationHelper | null>
}

/**
 * ========================================
 * useMMDAnimation Hook
 * ========================================
 * 
 * A hook for managing MMD animation playback with controls.
 * 
 * Features:
 * - Play/pause/stop controls
 * - Progress tracking
 * - Loop control
 * - Physics simulation
 * - Time seeking
 * 
 * @example
 * ```tsx
 * const { state, play, pause, stop, update, helperRef } = useMMDAnimation({
 *   enablePhysics: true,
 *   loop: false,
 * })
 * 
 * // In animation loop
 * useEffect(() => {
 *   const animate = () => {
 *     requestAnimationFrame(animate)
 *     update(clock.getDelta())
 *   }
 *   animate()
 * }, [update])
 * ```
 */
export const useMMDAnimation = (
  options: MMDAnimationOptions = {}
): UseMMDAnimationReturn => {
  const {
    enablePhysics = true,
    enableIK = true,
    enableGrant = true,
    loop = false,
  } = options

  // ========================================
  // State
  // ========================================
  const [state, setState] = useState<MMDAnimationState>({
    isPlaying: false,
    progress: 0,
    duration: 0,
    isLooping: loop,
  })

  // ========================================
  // Refs
  // ========================================
  const helperRef = useRef<MMDAnimationHelper | null>(null)
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())
  const startTimeRef = useRef<number>(0)
  const pauseTimeRef = useRef<number>(0)

  /**
   * Initialize helper
   */
  useEffect(() => {
    if (!helperRef.current) {
      helperRef.current = new MMDAnimationHelper()
    }
  }, [])

  /**
   * Play animation
   */
  const play = useCallback(() => {
    if (!helperRef.current) return

    helperRef.current.enable('animation', true)
    helperRef.current.enable('ik', enableIK)
    helperRef.current.enable('grant', enableGrant)
    helperRef.current.enable('physics', enablePhysics)

    clockRef.current.start()
    startTimeRef.current = clockRef.current.getElapsedTime() - pauseTimeRef.current

    setState(prev => ({ ...prev, isPlaying: true }))
  }, [enablePhysics, enableIK, enableGrant])

  /**
   * Pause animation
   */
  const pause = useCallback(() => {
    if (!helperRef.current) return

    pauseTimeRef.current = clockRef.current.getElapsedTime() - startTimeRef.current
    setState(prev => ({ ...prev, isPlaying: false }))
  }, [])

  /**
   * Stop animation
   */
  const stop = useCallback(() => {
    if (!helperRef.current) return

    clockRef.current.stop()
    startTimeRef.current = 0
    pauseTimeRef.current = 0

    setState(prev => ({
      ...prev,
      isPlaying: false,
      progress: 0,
    }))
  }, [])

  /**
   * Seek to time
   */
  const seek = useCallback((time: number) => {
    if (!helperRef.current) return

    const clampedTime = Math.max(0, Math.min(time, state.duration))
    pauseTimeRef.current = clampedTime

    if (state.isPlaying) {
      startTimeRef.current = clockRef.current.getElapsedTime() - clampedTime
    }

    setState(prev => ({
      ...prev,
      progress: state.duration > 0 ? clampedTime / state.duration : 0,
    }))
  }, [state.duration, state.isPlaying])

  /**
   * Set loop
   */
  const setLoop = useCallback((shouldLoop: boolean) => {
    setState(prev => ({ ...prev, isLooping: shouldLoop }))
  }, [])

  /**
   * Update animation
   */
  const update = useCallback((delta: number) => {
    if (!helperRef.current) return

    helperRef.current.update(delta)

    if (state.isPlaying && state.duration > 0) {
      const currentTime = clockRef.current.getElapsedTime() - startTimeRef.current
      const progress = currentTime / state.duration

      if (progress >= 1) {
        if (state.isLooping) {
          // Loop
          startTimeRef.current = clockRef.current.getElapsedTime()
          setState(prev => ({ ...prev, progress: 0 }))
        } else {
          // Stop at end
          setState(prev => ({ ...prev, isPlaying: false, progress: 1 }))
        }
      } else {
        setState(prev => ({ ...prev, progress }))
      }
    }
  }, [state.isPlaying, state.duration, state.isLooping])

  return {
    state,
    play,
    pause,
    stop,
    seek,
    setLoop,
    update,
    helperRef,
  }
}

export default useMMDAnimation
