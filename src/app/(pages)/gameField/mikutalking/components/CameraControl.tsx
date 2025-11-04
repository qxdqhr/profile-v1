'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'

/**
 * 相机控制组件的属性接口
 */
interface CameraControlProps {
  /** 相机移动回调函数 - deltaX: 水平偏移量, deltaY: 垂直偏移量 */
  onCameraMove: (deltaX: number, deltaY: number) => void
  /** 相机缩放回调函数 - delta: 缩放增量 */
  onCameraZoom: (delta: number) => void
  /** 相机升降回调函数 - delta: Z轴移动增量 */
  onCameraElevate: (delta: number) => void
  /** 重置相机回调函数 - 恢复相机到初始位置和角度 */
  onCameraReset: () => void
}

/**
 * 相机控制组件
 * 
 * 功能说明：
 * - 提供虚拟摇杆控制，用于调整相机视角
 * - 支持放大/缩小功能
 * - 提供一键重置相机位置的功能
 * - 摇杆采用物理拖拽方式，支持触摸和鼠标操作
 * - 实时更新相机位置，提供流畅的视角控制体验
 * 
 * @component
 */
export default function CameraControl({ onCameraMove, onCameraZoom, onCameraElevate, onCameraReset }: CameraControlProps) {
  // ========== 状态管理 ==========
  /** 是否正在拖拽摇杆 */
  const [isDragging, setIsDragging] = useState(false)
  /** 摇杆相对于中心的位置（单位：像素） */
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
  
  // ========== Refs ==========
  /** 基座DOM元素引用，用于获取位置信息 */
  const baseRef = useRef<HTMLDivElement>(null)
  /** 动画帧ID引用，用于取消动画循环 */
  const animationFrameRef = useRef<number | null>(null)
  
  // ========== 摇杆配置常量 ==========
  const BASE_RADIUS = 75         // 基座半径（像素）
  const JOYSTICK_RADIUS = 25     // 摇杆半径（像素）
  const MAX_DISTANCE = BASE_RADIUS - JOYSTICK_RADIUS  // 摇杆可移动的最大距离
  const MOVE_SENSITIVITY = 0.03  // 移动灵敏度（影响相机移动速度）

  /**
   * 获取基座中心坐标（屏幕坐标系）
   * @returns 基座中心的 {x, y} 坐标
   */
  const getBaseCenter = useCallback(() => {
    if (!baseRef.current) return { x: 0, y: 0 }
    const rect = baseRef.current.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }, [])

  /**
   * 计算摇杆位置（限制在基座范围内）
   * 
   * 计算逻辑：
   * 1. 根据触摸/鼠标位置计算相对于中心的偏移量
   * 2. 计算距离中心的距离
   * 3. 如果超出最大距离，则限制在圆形边界内
   * 
   * @param clientX - 触摸/鼠标的 X 坐标
   * @param clientY - 触摸/鼠标的 Y 坐标
   * @returns 摇杆位置 {x, y} 和距离 distance
   */
  const calculateJoystickPosition = useCallback((clientX: number, clientY: number) => {
    const center = getBaseCenter()
    let deltaX = clientX - center.x
    let deltaY = clientY - center.y
    
    // 计算距离中心的距离（勾股定理）
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // 如果超出最大范围，则限制在圆形边界内
    if (distance > MAX_DISTANCE) {
      const angle = Math.atan2(deltaY, deltaX)  // 计算角度
      deltaX = Math.cos(angle) * MAX_DISTANCE   // 根据角度计算新的 X 偏移
      deltaY = Math.sin(angle) * MAX_DISTANCE   // 根据角度计算新的 Y 偏移
    }
    
    return { x: deltaX, y: deltaY, distance }
  }, [getBaseCenter, MAX_DISTANCE])

  /**
   * 开始拖拽事件处理
   * 当用户按下摇杆时触发
   */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const pos = calculateJoystickPosition(e.clientX, e.clientY)
    setJoystickPos({ x: pos.x, y: pos.y })
  }, [calculateJoystickPosition])

  /**
   * 拖拽移动事件处理
   * 只更新摇杆位置，实际的相机移动在 useEffect 中通过 requestAnimationFrame 处理
   */
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    e.preventDefault()
    
    const pos = calculateJoystickPosition(e.clientX, e.clientY)
    setJoystickPos({ x: pos.x, y: pos.y })
  }, [isDragging, calculateJoystickPosition])

  /**
   * 结束拖拽事件处理
   * 松开摇杆时，摇杆自动回到中心位置
   */
  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    // 摇杆回到中心（CSS transition 会提供弹性动画效果）
    setJoystickPos({ x: 0, y: 0 })
  }, [])

  /**
   * 全局监听器 Effect
   * 确保在任何地方松开鼠标/触摸都能正确结束拖拽
   */
  useEffect(() => {
    if (isDragging) {
      // 在拖拽状态下，监听全局的 pointer 事件
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
      
      // 清理函数：移除事件监听器
      return () => {
        window.removeEventListener('pointermove', handleGlobalPointerMove)
        window.removeEventListener('pointerup', handleGlobalPointerUp)
      }
    }
  }, [isDragging, calculateJoystickPosition])

  /**
   * 相机移动循环 Effect
   * 使用 requestAnimationFrame 持续检测摇杆位置并触发相机移动
   * 这样可以提供流畅的相机控制体验
   */
  useEffect(() => {
    const updateCamera = () => {
      // 只有当摇杆不在中心位置时才触发移动
      if (joystickPos.x !== 0 || joystickPos.y !== 0) {
        // 将摇杆位置归一化到 -1 到 1 的范围
        const normalizedX = joystickPos.x / MAX_DISTANCE
        const normalizedY = joystickPos.y / MAX_DISTANCE
        
        // 应用移动（乘以灵敏度系数，控制相机移动速度）
        onCameraMove(normalizedX * MOVE_SENSITIVITY, normalizedY * MOVE_SENSITIVITY)
      }
      
      // 请求下一帧，形成动画循环
      animationFrameRef.current = requestAnimationFrame(updateCamera)
    }
    
    // 启动动画循环
    animationFrameRef.current = requestAnimationFrame(updateCamera)
    
    // 清理函数：取消动画循环
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [joystickPos, onCameraMove, MAX_DISTANCE, MOVE_SENSITIVITY])

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-4 items-center">
      {/* ========== 摇杆控制器区域 ========== */}
      {/* 摇杆控制器容器 */}
      <div className="relative">
        {/* 基座 - 定义摇杆的拖拽范围 */}
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
          {/* 中心十字线 - 辅助定位 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-1 h-full bg-white/10" /> {/* 垂直线 */}
            <div className="absolute w-full h-1 bg-white/10" /> {/* 水平线 */}
          </div>

          {/* 中心点标记 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full pointer-events-none" />

          {/* 摇杆 - 可拖拽的圆形控制器 */}
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

        {/* 拖拽时的提示文本 */}
        {isDragging && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="bg-black/75 text-white px-3 py-1.5 rounded-full text-xs font-medium">
              拖动调整视角 👁️
            </div>
          </div>
        )}
      </div>

      {/* ========== 缩放按钮组 ========== */}
      <div className="flex gap-2">
        {/* 放大按钮 - 负值表示拉近相机 */}
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
        
        {/* 缩小按钮 - 正值表示推远相机 */}
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

      {/* ========== 升降按钮组 ========== */}
      <div className="flex gap-2">
        {/* 升高按钮 - 正值表示向上移动 */}
        <button
          onClick={() => onCameraElevate(0.5)}
          className="
            w-12 h-12 rounded-full 
            bg-gradient-to-br from-green-400/90 to-green-500/90 backdrop-blur-sm shadow-lg
            flex items-center justify-center
            hover:from-green-500 hover:to-green-600 hover:scale-110 active:scale-95
            transition-all duration-200
          "
          title="升高视角"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
        
        {/* 降低按钮 - 负值表示向下移动 */}
        <button
          onClick={() => onCameraElevate(-0.5)}
          className="
            w-12 h-12 rounded-full 
            bg-gradient-to-br from-orange-400/90 to-orange-500/90 backdrop-blur-sm shadow-lg
            flex items-center justify-center
            hover:from-orange-500 hover:to-orange-600 hover:scale-110 active:scale-95
            transition-all duration-200
          "
          title="降低视角"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>

      {/* ========== 重置按钮 ========== */}
      {/* 重置视角按钮 - 恢复相机到默认位置和角度 */}
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

