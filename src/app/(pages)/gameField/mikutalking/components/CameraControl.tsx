'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'

interface CameraControlProps {
  onCameraMove: (deltaX: number, deltaY: number) => void
  onCameraZoom: (delta: number) => void
  onCameraReset: () => void
}

export default function CameraControl({ onCameraMove, onCameraZoom, onCameraReset }: CameraControlProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 }) // 摇杆相对于中心的位置
  const baseRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  
  // 摇杆范围（基座半径）- 扩大1.5倍
  const BASE_RADIUS = 75 // 基座半径（像素）
  const JOYSTICK_RADIUS = 25 // 摇杆半径（像素）
  const MAX_DISTANCE = BASE_RADIUS - JOYSTICK_RADIUS // 摇杆可移动的最大距离
  const MOVE_SENSITIVITY = 0.03 // 移动灵敏度

  // 获取基座中心坐标
  const getBaseCenter = useCallback(() => {
    if (!baseRef.current) return { x: 0, y: 0 }
    const rect = baseRef.current.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }, [])

  // 计算摇杆位置（限制在基座范围内）
  const calculateJoystickPosition = useCallback((clientX: number, clientY: number) => {
    const center = getBaseCenter()
    let deltaX = clientX - center.x
    let deltaY = clientY - center.y
    
    // 计算距离
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // 限制在最大范围内
    if (distance > MAX_DISTANCE) {
      const angle = Math.atan2(deltaY, deltaX)
      deltaX = Math.cos(angle) * MAX_DISTANCE
      deltaY = Math.sin(angle) * MAX_DISTANCE
    }
    
    return { x: deltaX, y: deltaY, distance }
  }, [getBaseCenter, MAX_DISTANCE])

  // 开始拖拽
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const pos = calculateJoystickPosition(e.clientX, e.clientY)
    setJoystickPos({ x: pos.x, y: pos.y })
  }, [calculateJoystickPosition])

  // 拖拽中（只更新摇杆位置，不触发移动）
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    e.preventDefault()
    
    const pos = calculateJoystickPosition(e.clientX, e.clientY)
    setJoystickPos({ x: pos.x, y: pos.y })
  }, [isDragging, calculateJoystickPosition])

  // 结束拖拽
  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    // 摇杆回到中心（添加弹性动画）
    setJoystickPos({ x: 0, y: 0 })
  }, [])

  // 全局监听（确保在任何地方松开都能结束拖拽）
  useEffect(() => {
    if (isDragging) {
      const handleGlobalPointerMove = (e: PointerEvent) => {
        const pos = calculateJoystickPosition(e.clientX, e.clientY)
        setJoystickPos({ x: pos.x, y: pos.y })
      }
      
      const handleGlobalPointerUp = () => {
        setIsDragging(false)
        setJoystickPos({ x: 0, y: 0 })
      }
      
      window.addEventListener('pointermove', handleGlobalPointerMove)
      window.addEventListener('pointerup', handleGlobalPointerUp)
      
      return () => {
        window.removeEventListener('pointermove', handleGlobalPointerMove)
        window.removeEventListener('pointerup', handleGlobalPointerUp)
      }
    }
  }, [isDragging, calculateJoystickPosition])

  // 持续检测摇杆位置并触发相机移动
  useEffect(() => {
    const updateCamera = () => {
      // 只有当摇杆不在中心位置时才触发移动
      if (joystickPos.x !== 0 || joystickPos.y !== 0) {
        // 归一化到 -1 到 1
        const normalizedX = joystickPos.x / MAX_DISTANCE
        const normalizedY = joystickPos.y / MAX_DISTANCE
        
        // 应用移动（乘以灵敏度系数）
        onCameraMove(normalizedX * MOVE_SENSITIVITY, normalizedY * MOVE_SENSITIVITY)
      }
      
      // 继续下一帧
      animationFrameRef.current = requestAnimationFrame(updateCamera)
    }
    
    // 开始动画循环
    animationFrameRef.current = requestAnimationFrame(updateCamera)
    
    // 清理
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [joystickPos, onCameraMove, MAX_DISTANCE, MOVE_SENSITIVITY])

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-4 items-center">
      {/* 摇杆控制器 */}
      <div className="relative">
        {/* 基座（拖拽范围） */}
        <div
          ref={baseRef}
          className={`
            relative
            bg-gradient-to-br from-gray-800/50 to-gray-900/50
            backdrop-blur-sm
            rounded-full
            shadow-2xl
            border-4 border-gray-700/50
            transition-all duration-200
            ${isDragging ? 'scale-105 border-purple-500/50 shadow-purple-500/30' : ''}
          `}
          style={{
            width: `${BASE_RADIUS * 2}px`,
            height: `${BASE_RADIUS * 2}px`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* 中心十字线 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-1 h-full bg-white/10" />
            <div className="absolute w-full h-1 bg-white/10" />
          </div>

          {/* 中心点 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full pointer-events-none" />

          {/* 摇杆 */}
          <div
            className={`
              absolute top-1/2 left-1/2
              bg-gradient-to-br from-purple-500 to-pink-500
              rounded-full
              shadow-xl
              flex items-center justify-center
              cursor-grab
              ${isDragging ? 'cursor-grabbing scale-110' : 'hover:scale-105'}
              transition-all duration-200
            `}
            style={{
              width: `${JOYSTICK_RADIUS * 2}px`,
              height: `${JOYSTICK_RADIUS * 2}px`,
              transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </div>
        </div>

        {/* 提示文本 */}
        {isDragging && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="bg-black/75 text-white px-3 py-1.5 rounded-full text-xs font-medium">
              拖动调整视角 👁️
            </div>
          </div>
        )}
      </div>

      {/* 缩放按钮组 */}
      <div className="flex gap-2">
        <button
          onClick={() => onCameraZoom(-0.5)}
          className="
            w-12 h-12 rounded-full 
            bg-white/90 backdrop-blur-sm shadow-lg
            flex items-center justify-center
            hover:bg-white hover:scale-110 active:scale-95
            transition-all duration-200
          "
          title="放大"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        
        <button
          onClick={() => onCameraZoom(0.5)}
          className="
            w-12 h-12 rounded-full 
            bg-white/90 backdrop-blur-sm shadow-lg
            flex items-center justify-center
            hover:bg-white hover:scale-110 active:scale-95
            transition-all duration-200
          "
          title="缩小"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 12H6" />
          </svg>
        </button>
      </div>

      {/* 重置按钮 */}
      <button
        onClick={onCameraReset}
        className="
          w-14 h-14 rounded-full 
          bg-gradient-to-br from-blue-500 to-cyan-500
          shadow-xl
          flex items-center justify-center
          hover:from-blue-600 hover:to-cyan-600
          hover:scale-110
          active:scale-95
          transition-all duration-200
        "
        title="重置视角"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  )
}

