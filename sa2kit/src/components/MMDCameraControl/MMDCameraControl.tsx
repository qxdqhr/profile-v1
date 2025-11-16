/**
 * MMDCameraControl Component
 * 
 * A React component for controlling MMD camera with virtual joystick
 * 
 * @module sa2kit/components/MMDCameraControl
 * @author SA2Kit Team
 * @license MIT
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import type { MMDCameraControlProps, ControlSizeConfig, ControlThemeConfig } from './types'

/**
 * ========================================
 * 默认配置
 * ========================================
 */
const SIZE_CONFIG: Record<'small' | 'medium' | 'large', ControlSizeConfig> = {
  small: {
    baseRadius: 50,
    joystickRadius: 18,
    buttonSize: 36,
    gap: 8,
  },
  medium: {
    baseRadius: 75,
    joystickRadius: 25,
    buttonSize: 48,
    gap: 12,
  },
  large: {
    baseRadius: 100,
    joystickRadius: 32,
    buttonSize: 60,
    gap: 16,
  },
}

const THEME_CONFIG: Record<'light' | 'dark', ControlThemeConfig> = {
  light: {
    baseBackground: 'rgba(255, 255, 255, 0.3)',
    baseBorder: 'rgba(0, 0, 0, 0.2)',
    joystickBackground: 'rgba(255, 255, 255, 0.9)',
    buttonBackground: 'rgba(255, 255, 255, 0.9)',
    buttonText: 'rgba(0, 0, 0, 0.8)',
    highlightColor: 'rgba(59, 130, 246, 0.9)', // blue-500
  },
  dark: {
    baseBackground: 'rgba(0, 0, 0, 0.3)',
    baseBorder: 'rgba(255, 255, 255, 0.2)',
    joystickBackground: 'rgba(255, 255, 255, 0.9)',
    buttonBackground: 'rgba(255, 255, 255, 0.2)',
    buttonText: 'rgba(255, 255, 255, 0.9)',
    highlightColor: 'rgba(139, 92, 246, 0.9)', // violet-500
  },
}

/**
 * ========================================
 * MMDCameraControl Component
 * ========================================
 * 
 * A camera control component with virtual joystick for MMD scenes.
 * 
 * Features:
 * - Virtual joystick for camera rotation
 * - Zoom in/out buttons
 * - Elevate/lower buttons (Z-axis)
 * - Reset camera button
 * - Configurable size, theme, position
 * - Touch and mouse support
 * 
 * @example
 * ```tsx
 * <MMDCameraControl
 *   onCameraMove={(dx, dy) => console.log('Move:', dx, dy)}
 *   onCameraZoom={(delta) => console.log('Zoom:', delta)}
 *   onCameraElevate={(delta) => console.log('Elevate:', delta)}
 *   onCameraReset={() => console.log('Reset')}
 *   position="bottom-right"
 *   size="medium"
 *   theme="dark"
 * />
 * ```
 */
export const MMDCameraControl: React.FC<MMDCameraControlProps> = ({
  // Callbacks
  onCameraMove,
  onCameraZoom,
  onCameraElevate,
  onCameraReset,
  
  // UI config
  position = 'bottom-right',
  size = 'medium',
  theme = 'dark',
  
  // Feature switches
  showJoystick = true,
  showZoomButtons = true,
  showElevateButtons = true,
  showResetButton = true,
  
  // Sensitivity
  moveSensitivity = 0.03,
  zoomSensitivity = 0.5,
  elevateSensitivity = 0.5,
  
  // Style
  className = '',
  style = {},
  
  // Debug
  debugMode = false,
}) => {
  // ========================================
  // State
  // ========================================
  const [isDragging, setIsDragging] = useState(false)
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
  
  // ========================================
  // Refs
  // ========================================
  const baseRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  
  // ========================================
  // Config
  // ========================================
  const sizeConfig = SIZE_CONFIG[size]
  const themeConfig = THEME_CONFIG[theme === 'auto' ? 'dark' : theme]
  const maxDistance = sizeConfig.baseRadius - sizeConfig.joystickRadius

  /**
   * Get base center coordinates
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
   * Calculate joystick position
   */
  const calculateJoystickPosition = useCallback((clientX: number, clientY: number) => {
    const center = getBaseCenter()
    let deltaX = clientX - center.x
    let deltaY = clientY - center.y
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (distance > maxDistance) {
      const angle = Math.atan2(deltaY, deltaX)
      deltaX = Math.cos(angle) * maxDistance
      deltaY = Math.sin(angle) * maxDistance
    }
    
    return { x: deltaX, y: deltaY, distance }
  }, [getBaseCenter, maxDistance])

  /**
   * Pointer event handlers
   */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const pos = calculateJoystickPosition(e.clientX, e.clientY)
    setJoystickPos({ x: pos.x, y: pos.y })
  }, [calculateJoystickPosition])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const pos = calculateJoystickPosition(e.clientX, e.clientY)
    setJoystickPos({ x: pos.x, y: pos.y })
  }, [isDragging, calculateJoystickPosition])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    setJoystickPos({ x: 0, y: 0 })
  }, [])

  /**
   * Global pointer event listeners
   */
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
    return undefined
  }, [isDragging, calculateJoystickPosition])

  /**
   * Camera movement loop
   */
  useEffect(() => {
    const updateCamera = () => {
      if (joystickPos.x !== 0 || joystickPos.y !== 0) {
        const normalizedX = joystickPos.x / maxDistance
        const normalizedY = joystickPos.y / maxDistance
        onCameraMove(normalizedX * moveSensitivity, normalizedY * moveSensitivity)
      }
      
      animationFrameRef.current = requestAnimationFrame(updateCamera)
    }
    
    animationFrameRef.current = requestAnimationFrame(updateCamera)
    
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [joystickPos, maxDistance, moveSensitivity, onCameraMove])

  /**
   * Position styles
   */
  const positionStyles = useMemo(() => {
    const base: React.CSSProperties = {
      position: 'fixed' as const,
      zIndex: 1000,
    }
    
    switch (position) {
      case 'bottom-right':
        return { ...base, bottom: '2rem', right: '2rem' }
      case 'bottom-left':
        return { ...base, bottom: '2rem', left: '2rem' }
      case 'top-right':
        return { ...base, top: '2rem', right: '2rem' }
      case 'top-left':
        return { ...base, top: '2rem', left: '2rem' }
    }
  }, [position])

  /**
   * Button handler factory
   */
  const createButtonHandler = useCallback((callback: (delta: number) => void, delta: number) => {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      callback(delta)
    }
  }, [])

  /**
   * ========================================
   * Render
   * ========================================
   */
  return (
    <div
      className={`sa2kit-camera-control ${className}`}
      style={{
        ...positionStyles,
        ...style,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: `${sizeConfig.gap}px`,
        userSelect: 'none',
      }}
    >
      {/* Debug info */}
      {debugMode && (
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            left: 0,
            padding: '4px 8px',
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            fontSize: '12px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          JoyStick: ({joystickPos.x.toFixed(1)}, {joystickPos.y.toFixed(1)})
        </div>
      )}

      {/* Joystick */}
      {showJoystick && (
        <div
          ref={baseRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            position: 'relative',
            width: `${sizeConfig.baseRadius * 2}px`,
            height: `${sizeConfig.baseRadius * 2}px`,
            borderRadius: '50%',
            background: themeConfig.baseBackground,
            border: `2px solid ${themeConfig.baseBorder}`,
            cursor: 'pointer',
            touchAction: 'none',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${sizeConfig.joystickRadius * 2}px`,
              height: `${sizeConfig.joystickRadius * 2}px`,
              borderRadius: '50%',
              background: isDragging ? themeConfig.highlightColor : themeConfig.joystickBackground,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
              transition: isDragging ? 'none' : 'all 0.2s ease-out',
            }}
          />
        </div>
      )}

      {/* Control buttons */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: `${sizeConfig.gap}px`,
          maxWidth: `${sizeConfig.baseRadius * 2}px`,
        }}
      >
        {/* Zoom buttons */}
        {showZoomButtons && (
          <>
            <ControlButton
              onClick={createButtonHandler(onCameraZoom, -zoomSensitivity)}
              icon="−"
              title="缩小"
              size={sizeConfig.buttonSize}
              theme={themeConfig}
            />
            <ControlButton
              onClick={createButtonHandler(onCameraZoom, zoomSensitivity)}
              icon="+"
              title="放大"
              size={sizeConfig.buttonSize}
              theme={themeConfig}
            />
          </>
        )}

        {/* Elevate buttons */}
        {showElevateButtons && (
          <>
            <ControlButton
              onClick={createButtonHandler(onCameraElevate, elevateSensitivity)}
              icon="↑"
              title="升高视角"
              size={sizeConfig.buttonSize}
              theme={themeConfig}
            />
            <ControlButton
              onClick={createButtonHandler(onCameraElevate, -elevateSensitivity)}
              icon="↓"
              title="降低视角"
              size={sizeConfig.buttonSize}
              theme={themeConfig}
            />
          </>
        )}

        {/* Reset button */}
        {showResetButton && (
          <ControlButton
            onClick={(e) => {
              e.preventDefault()
              onCameraReset()
            }}
            icon="◎"
            title="重置视角"
            size={sizeConfig.buttonSize}
            theme={themeConfig}
          />
        )}
      </div>
    </div>
  )
}

/**
 * ========================================
 * Control Button Component
 * ========================================
 */
interface ControlButtonProps {
  onClick: (e: React.MouseEvent) => void
  icon: string
  title: string
  size: number
  theme: ControlThemeConfig
}

const ControlButton: React.FC<ControlButtonProps> = ({ onClick, icon, title, size, theme }) => {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <button
      onClick={onClick}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      title={title}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        border: `2px solid ${theme.baseBorder}`,
        background: isPressed ? theme.highlightColor : theme.buttonBackground,
        color: theme.buttonText,
        fontSize: `${size * 0.5}px`,
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        touchAction: 'none',
        backdropFilter: 'blur(10px)',
        boxShadow: isPressed
          ? '0 2px 4px rgba(0,0,0,0.2)'
          : '0 4px 12px rgba(0,0,0,0.3)',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
      }}
    >
      {icon}
    </button>
  )
}

MMDCameraControl.displayName = 'MMDCameraControl'

export default MMDCameraControl
