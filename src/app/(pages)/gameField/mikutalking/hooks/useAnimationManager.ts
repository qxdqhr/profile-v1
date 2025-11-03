import { useState, useCallback, useRef, useEffect } from 'react'
import type { AnimationType } from '../types'
import { ANIMATIONS } from '../constants/animations'

/**
 * 动画管理Hook
 * 管理动画队列、切换和优先级
 */
export function useAnimationManager() {
  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>('idle')
  const [animationQueue, setAnimationQueue] = useState<AnimationType[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 播放动画
  const playAnimation = useCallback((animation: AnimationType, force = false) => {
    const config = ANIMATIONS[animation]
    
    if (!config) {
      console.warn('未知动画:', animation)
      return
    }

    // 如果强制播放或优先级更高，立即切换
    if (force || (config.priority || 0) > (ANIMATIONS[currentAnimation]?.priority || 0)) {
      setCurrentAnimation(animation)
      setIsAnimating(true)
      
      // 清除旧的定时器
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }

      // 如果动画有持续时间，自动切换回待机
      if (config.duration && !config.loop) {
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false)
          // 检查队列中是否有待播放的动画
          setAnimationQueue(prev => {
            if (prev.length > 0) {
              const next = prev[0]
              playAnimation(next)
              return prev.slice(1)
            }
            // 否则回到待机状态
            setCurrentAnimation('idle')
            return []
          })
        }, config.duration * 1000)
      }
      
      console.log('播放动画:', animation, '持续时间:', config.duration)
    } else {
      // 否则加入队列
      setAnimationQueue(prev => [...prev, animation])
    }
  }, [currentAnimation])

  // 停止当前动画
  const stopAnimation = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    setCurrentAnimation('idle')
    setIsAnimating(false)
  }, [])

  // 清空动画队列
  const clearQueue = useCallback(() => {
    setAnimationQueue([])
  }, [])

  // 获取当前动画配置
  const getCurrentAnimationConfig = useCallback(() => {
    return ANIMATIONS[currentAnimation]
  }, [currentAnimation])

  // 清理
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  return {
    currentAnimation,
    animationQueue,
    isAnimating,
    playAnimation,
    stopAnimation,
    clearQueue,
    getCurrentAnimationConfig,
  }
}

