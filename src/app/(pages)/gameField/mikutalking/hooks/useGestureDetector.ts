import { useRef, useCallback, useState, useEffect } from 'react'
import type { GestureType, GestureEvent, BodyPart } from '../types'
import { DEFAULT_GAME_CONFIG } from '../types'

interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

/**
 * 手势检测Hook
 * 检测点击、拖拽、滑动等手势
 */
export function useGestureDetector(onGesture?: (event: GestureEvent) => void) {
  const [isDragging, setIsDragging] = useState(false)
  const touchStartRef = useRef<TouchPoint | null>(null)
  const touchEndRef = useRef<TouchPoint | null>(null)
  const lastTapRef = useRef<number>(0)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const dragPathRef = useRef<TouchPoint[]>([])

  // 开始触摸
  const handleTouchStart = useCallback((x: number, y: number, bodyPart: BodyPart) => {
    const now = Date.now()
    
    touchStartRef.current = { x, y, timestamp: now }
    dragPathRef.current = [{ x, y, timestamp: now }]
    setIsDragging(false)

    // 长按检测
    longPressTimerRef.current = setTimeout(() => {
      if (touchStartRef.current && !isDragging) {
        onGesture?.({
          type: 'long_press',
          bodyPart,
          position: { x, y },
          timestamp: Date.now(),
          duration: Date.now() - touchStartRef.current.timestamp,
        })
      }
    }, DEFAULT_GAME_CONFIG.longPressDuration)

    // 双击检测
    if (now - lastTapRef.current < DEFAULT_GAME_CONFIG.doubleTapDelay) {
      onGesture?.({
        type: 'double_tap',
        bodyPart,
        position: { x, y },
        timestamp: now,
      })
      lastTapRef.current = 0 // 重置
    } else {
      lastTapRef.current = now
    }
  }, [isDragging, onGesture])

  // 触摸移动
  const handleTouchMove = useCallback((x: number, y: number, bodyPart: BodyPart) => {
    if (!touchStartRef.current) return

    const now = Date.now()
    dragPathRef.current.push({ x, y, timestamp: now })

    const deltaX = x - touchStartRef.current.x
    const deltaY = y - touchStartRef.current.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // 如果移动距离超过阈值，认为是拖拽
    if (distance > DEFAULT_GAME_CONFIG.swipeThreshold && !isDragging) {
      setIsDragging(true)
      
      // 清除长按定时器
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }

    if (isDragging) {
      onGesture?.({
        type: 'drag',
        bodyPart,
        position: { x, y },
        timestamp: now,
        distance,
      })
    }
  }, [isDragging, onGesture])

  // 触摸结束
  const handleTouchEnd = useCallback((x: number, y: number, bodyPart: BodyPart) => {
    if (!touchStartRef.current) return

    const now = Date.now()
    touchEndRef.current = { x, y, timestamp: now }

    // 清除长按定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }

    const deltaX = x - touchStartRef.current.x
    const deltaY = y - touchStartRef.current.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const duration = now - touchStartRef.current.timestamp

    // 判断是否为滑动手势
    if (distance > DEFAULT_GAME_CONFIG.swipeThreshold && duration < 500) {
      // 计算滑动方向
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
      let gestureType: GestureType

      if (angle >= -45 && angle < 45) {
        gestureType = 'swipe_right'
      } else if (angle >= 45 && angle < 135) {
        gestureType = 'swipe_down'
      } else if (angle >= -135 && angle < -45) {
        gestureType = 'swipe_up'
      } else {
        gestureType = 'swipe_left'
      }

      onGesture?.({
        type: gestureType,
        bodyPart,
        position: { x, y },
        velocity: {
          x: deltaX / duration,
          y: deltaY / duration,
        },
        distance,
        duration,
        timestamp: now,
      })
    } else if (!isDragging && distance < 10) {
      // 单击
      onGesture?.({
        type: 'tap',
        bodyPart,
        position: { x, y },
        timestamp: now,
      })
    }

    // 重置状态
    setIsDragging(false)
    touchStartRef.current = null
    touchEndRef.current = null
    dragPathRef.current = []
  }, [isDragging, onGesture])

  // 清理
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  return {
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    dragPath: dragPathRef.current,
  }
}

