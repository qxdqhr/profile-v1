/**
 * MMDAnimationPlayer Component
 * 
 * A React component for playing MMD animations with audio synchronization
 * 
 * @module sa2kit/components/MMDAnimationPlayer
 * @author SA2Kit Team
 * @license MIT
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { MMDLoader, MMDAnimationHelper } from 'three-stdlib'

import type { MMDAnimationPlayerProps, PlaybackControls, AnimationLoadState } from './types'

/**
 * Logger utility (reused from MMDViewer)
 */
type LogLevel = 'none' | 'error' | 'warn' | 'info' | 'debug'

class Logger {
  private level: LogLevel
  private enabled: boolean

  constructor(level: LogLevel = 'warn', enabled: boolean = true) {
    this.level = level
    this.enabled = enabled
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false
    const levels: LogLevel[] = ['none', 'error', 'warn', 'info', 'debug']
    return levels.indexOf(level) <= levels.indexOf(this.level)
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) console.log('[SA2Kit:AnimationPlayer]', ...args)
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) console.info('[SA2Kit:AnimationPlayer]', ...args)
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) console.warn('[SA2Kit:AnimationPlayer]', ...args)
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) console.error('[SA2Kit:AnimationPlayer]', ...args)
  }
}

/**
 * ========================================
 * MMDAnimationPlayer Component
 * ========================================
 * 
 * A React component for playing VMD animations on MMD models.
 * Supports motion, camera, and audio synchronization.
 * 
 * Features:
 * - VMD motion playback
 * - Camera animation
 * - Audio synchronization
 * - Physics simulation
 * - Playback controls (play, pause, stop, seek)
 * - Progress tracking
 * 
 * @example
 * ```tsx
 * const modelRef = useRef<THREE.Group>(null)
 * 
 * <MMDAnimationPlayer
 *   modelRef={modelRef}
 *   motionPath="/animations/dance.vmd"
 *   audioPath="/animations/music.mp3"
 *   onReady={(controls) => {
 *     // Use playback controls
 *     controls.play()
 *   }}
 * />
 * ```
 */
export const MMDAnimationPlayer: React.FC<MMDAnimationPlayerProps> = ({
  // Required
  modelRef,
  
  // Animation config
  motionPath,
  cameraMotionPath,
  audioPath,
  
  // Playback control
  autoPlay = false,
  loop = false,
  volume = 0.7,
  playbackRate = 1.0,
  
  // Physics engine
  enablePhysics = true,
  enableIK = true,
  enableGrant = true,
  
  // Callbacks
  onReady,
  onPlay,
  onPause,
  onStop,
  onProgress,
  onEnd,
  onError,
  
  // Debug
  debugMode = false,
  logLevel = 'warn',
}) => {
  // Initialize logger
  const logger = useMemo(() => new Logger(logLevel, debugMode || logLevel !== 'none'), [logLevel, debugMode])

  // ========================================
  // Refs
  // ========================================
  const helperRef = useRef<MMDAnimationHelper | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationDurationRef = useRef<number>(0)
  const progressIntervalRef = useRef<number | null>(null)

  // ========================================
  // State
  // ========================================
  const [loadState, setLoadState] = useState<AnimationLoadState>({
    loading: false,
    progress: 0,
    error: null,
    loaded: false,
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  /**
   * ========================================
   * Load Animation
   * ========================================
   */
  const loadAnimation = useCallback(async () => {
    const model = modelRef.current
    if (!model) {
      logger.error('Model reference is null')
      return
    }

    if (!motionPath && !cameraMotionPath) {
      logger.warn('No animation paths provided')
      return
    }

    try {
      setLoadState({ loading: true, progress: 0, error: null, loaded: false })
      logger.info('Loading animation...')

      const loader = new MMDLoader()
      const helper = new MMDAnimationHelper()
      helperRef.current = helper

      let currentProgress = 0

      // Load motion
      if (motionPath) {
        logger.debug('Loading motion:', motionPath)
        setLoadState(prev => ({ ...prev, progress: 10 }))

        // Find SkinnedMesh
        let skinnedMesh: THREE.SkinnedMesh | null = null
        model.traverse((child) => {
          if (child instanceof THREE.SkinnedMesh && !skinnedMesh) {
            skinnedMesh = child
          }
        })

        if (!skinnedMesh) {
          throw new Error('SkinnedMesh not found in model')
        }

        const motion = await loader.loadAsync(motionPath, (progressEvent) => {
          const percent = (progressEvent.loaded / progressEvent.total) * 40 + 10
          setLoadState(prev => ({ ...prev, progress: Math.min(percent, 50) }))
        })

        helper.add(skinnedMesh, {
          animation: motion as any,
          physics: enablePhysics,
        })

        logger.debug('Motion loaded successfully')
        currentProgress = 50
      }

      // Load camera motion
      if (cameraMotionPath) {
        logger.debug('Loading camera motion:', cameraMotionPath)
        setLoadState(prev => ({ ...prev, progress: currentProgress + 10 }))

        // Note: Camera should be provided by parent component
        // This is just a placeholder for the loading logic
        logger.warn('Camera motion loading requires camera reference from parent')
        currentProgress += 30
      }

      // Load audio
      if (audioPath) {
        logger.debug('Loading audio:', audioPath)
        setLoadState(prev => ({ ...prev, progress: currentProgress + 10 }))

        const audio = new Audio(audioPath)
        audio.volume = volume
        audio.playbackRate = playbackRate
        audio.loop = loop
        
        audio.onended = () => {
          if (!loop) {
            setIsPlaying(false)
            onEnd?.()
            logger.info('Animation ended')
          }
        }

        audio.onerror = (e) => {
          logger.error('Audio loading error:', e)
        }

        audioRef.current = audio
        animationDurationRef.current = audio.duration || 0

        logger.debug('Audio loaded successfully')
      }

      setLoadState({ loading: false, progress: 100, error: null, loaded: true })
      logger.info('Animation loaded successfully')

      // Auto play
      if (autoPlay) {
        setTimeout(() => play(), 100)
      }

    } catch (error) {
      logger.error('Animation loading failed:', error)
      const err = error instanceof Error ? error : new Error('Failed to load animation')
      setLoadState({ loading: false, progress: 0, error: err, loaded: false })
      onError?.(err)
    }
  }, [modelRef, motionPath, cameraMotionPath, audioPath, enablePhysics, volume, playbackRate, loop, autoPlay, onError, onEnd, logger])

  /**
   * ========================================
   * Playback Controls
   * ========================================
   */
  const play = useCallback(async () => {
    if (!helperRef.current) {
      logger.warn('Animation helper not initialized')
      return
    }

    logger.info('Playing animation')

    // Enable animation features
    helperRef.current.enable('animation', true)
    helperRef.current.enable('ik', enableIK)
    helperRef.current.enable('grant', enableGrant)
    helperRef.current.enable('physics', enablePhysics)

    // Play audio
    if (audioRef.current) {
      try {
        await audioRef.current.play()
      } catch (error) {
        logger.error('Audio playback error:', error)
      }
    }

    setIsPlaying(true)
    onPlay?.()

    // Start progress tracking
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    progressIntervalRef.current = window.setInterval(() => {
      if (audioRef.current && animationDurationRef.current > 0) {
        const currentProgress = audioRef.current.currentTime / animationDurationRef.current
        setProgress(currentProgress)
        onProgress?.(currentProgress)
      }
    }, 100)
  }, [enableIK, enableGrant, enablePhysics, onPlay, onProgress, logger])

  const pause = useCallback(() => {
    logger.info('Pausing animation')

    if (audioRef.current) {
      audioRef.current.pause()
    }

    setIsPlaying(false)
    onPause?.()

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [onPause, logger])

  const stop = useCallback(() => {
    logger.info('Stopping animation')

    if (helperRef.current && modelRef.current) {
      // Reset model pose
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh) {
          try {
            helperRef.current?.pose(child, {})
          } catch (error) {
            logger.warn('Failed to reset pose:', error)
          }
        }
      })
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    setIsPlaying(false)
    setProgress(0)
    onStop?.()

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [modelRef, onStop, logger])

  const seek = useCallback((time: number) => {
    logger.debug('Seeking to:', time)

    if (audioRef.current && animationDurationRef.current > 0) {
      const clampedTime = Math.max(0, Math.min(time, animationDurationRef.current))
      audioRef.current.currentTime = clampedTime
      setProgress(clampedTime / animationDurationRef.current)
    }
  }, [logger])

  const setVolumeControl = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    logger.debug('Setting volume:', clampedVolume)

    if (audioRef.current) {
      audioRef.current.volume = clampedVolume
    }
  }, [logger])

  const setLoopControl = useCallback((shouldLoop: boolean) => {
    logger.debug('Setting loop:', shouldLoop)

    if (audioRef.current) {
      audioRef.current.loop = shouldLoop
    }
  }, [logger])

  /**
   * ========================================
   * Expose Controls
   * ========================================
   */
  useEffect(() => {
    if (loadState.loaded && onReady) {
      const controls: PlaybackControls = {
        play,
        pause,
        stop,
        seek,
        isPlaying,
        progress,
        duration: animationDurationRef.current,
        setVolume: setVolumeControl,
        setLoop: setLoopControl,
      }
      onReady(controls)
    }
  }, [loadState.loaded, onReady, play, pause, stop, seek, isPlaying, progress, setVolumeControl, setLoopControl])

  /**
   * ========================================
   * Lifecycle
   * ========================================
   */
  useEffect(() => {
    if (modelRef.current) {
      loadAnimation()
    }

    return () => {
      // Cleanup
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (helperRef.current) {
        helperRef.current = null
      }
    }
  }, [loadAnimation, modelRef])

  /**
   * ========================================
   * Render
   * ========================================
   * 
   * Note: This component doesn't render anything visible.
   * It only manages animation playback logic.
   */
  return null
}

MMDAnimationPlayer.displayName = 'MMDAnimationPlayer'

export default MMDAnimationPlayer
