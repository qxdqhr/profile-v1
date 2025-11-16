/**
 * Advanced Usage Example for SA2Kit
 * 
 * This example demonstrates advanced features including:
 * - Custom camera controls
 * - Animation playback management
 * - Progress tracking
 * - Multiple models
 */

import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import {
  MMDViewer,
  MMDAnimationPlayer,
  MMDCameraControl,
  useMMDAnimation,
  useMMDCamera,
  useMMDLoader,
  type AnimationControls,
  type CameraControls,
  type PlaybackControls,
} from 'sa2kit'

/**
 * Advanced MMD Scene Component
 */
export default function AdvancedMMDScene() {
  // ===== State =====
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [currentAnimation, setCurrentAnimation] = useState<string>('')
  const [progress, setProgress] = useState(0)

  // ===== Refs =====
  const modelRef = useRef<THREE.Group>(null)
  const animationControlsRef = useRef<AnimationControls | null>(null)
  const cameraControlsRef = useRef<CameraControls | null>(null)
  const playbackControlsRef = useRef<PlaybackControls | null>(null)

  // ===== Hooks =====
  const { loadState, resource, loadModel, loadMotion } = useMMDLoader()
  const animationHook = useMMDAnimation({
    enablePhysics: true,
    enableIK: true,
    loop: false,
  })
  const cameraHook = useMMDCamera({
    position: new THREE.Vector3(0, 10, 30),
    target: new THREE.Vector3(0, 10, 0),
    minDistance: 5,
    maxDistance: 100,
  })

  /**
   * Load model on mount
   */
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        
        // Load model
        const model = await loadModel('/models/miku/model.pmx', (progress) => {
          console.log('Model loading:', progress)
        })
        
        console.log('Model loaded:', model)
        setIsLoading(false)
      } catch (error) {
        console.error('Loading failed:', error)
        setError(error as Error)
        setIsLoading(false)
      }
    }
    
    load()
  }, [])

  /**
   * Handle animation selection
   */
  const handleAnimationChange = async (animationPath: string) => {
    try {
      setCurrentAnimation(animationPath)
      
      // Load new animation
      const motion = await loadMotion(animationPath)
      console.log('Animation loaded:', motion)
      
      // Play animation
      if (playbackControlsRef.current) {
        playbackControlsRef.current.play()
      }
    } catch (error) {
      console.error('Animation loading failed:', error)
    }
  }

  /**
   * Handle camera controls
   */
  const handleCameraMove = (deltaX: number, deltaY: number) => {
    cameraHook.controls.moveCamera(deltaX, deltaY)
  }

  const handleCameraZoom = (delta: number) => {
    cameraHook.controls.zoomCamera(delta)
  }

  const handleCameraElevate = (delta: number) => {
    cameraHook.controls.elevateCamera(delta)
  }

  const handleCameraReset = () => {
    cameraHook.controls.resetCamera()
  }

  /**
   * Animation list
   */
  const animations = [
    { name: 'Dance 1', path: '/animations/dance1.vmd' },
    { name: 'Dance 2', path: '/animations/dance2.vmd' },
    { name: 'Wave', path: '/animations/wave.vmd' },
  ]

  // ===== Render =====
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* MMD Viewer */}
      <MMDViewer
        modelPath="/models/miku/model.pmx"
        texturePath="/models/miku/"
        backgroundColor="#1a1a2e"
        cameraPosition={[0, 10, 30]}
        targetPosition={[0, 10, 0]}
        enableShadows={true}
        onLoad={() => console.log('Viewer loaded')}
        onError={(err) => setError(err)}
        onCameraReady={(controls) => {
          cameraControlsRef.current = controls
          console.log('Camera ready')
        }}
        onAnimationReady={(controls) => {
          animationControlsRef.current = controls
          console.log('Animation ready')
        }}
      />

      {/* Animation Player */}
      {modelRef.current && currentAnimation && (
        <MMDAnimationPlayer
          modelRef={modelRef}
          motionPath={currentAnimation}
          audioPath={currentAnimation.replace('.vmd', '.mp3')}
          enablePhysics={true}
          enableIK={true}
          volume={0.7}
          loop={false}
          onReady={(controls) => {
            playbackControlsRef.current = controls
            console.log('Player ready')
          }}
          onProgress={(progress) => setProgress(progress)}
          onEnd={() => console.log('Animation ended')}
        />
      )}

      {/* Camera Control */}
      <MMDCameraControl
        onCameraMove={handleCameraMove}
        onCameraZoom={handleCameraZoom}
        onCameraElevate={handleCameraElevate}
        onCameraReset={handleCameraReset}
        position="bottom-right"
        size="medium"
        theme="dark"
        showJoystick={true}
        showZoomButtons={true}
        showElevateButtons={true}
        showResetButton={true}
      />

      {/* UI Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
          color: '#fff',
          pointerEvents: 'none',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px' }}>SA2Kit Advanced Demo</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.8 }}>
          Full-featured MMD viewer with controls
        </p>
      </div>

      {/* Animation Selector */}
      <div
        style={{
          position: 'absolute',
          top: '100px',
          left: '20px',
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '10px',
          color: '#fff',
          minWidth: '200px',
        }}
      >
        <h3 style={{ margin: '0 0 15px 0' }}>动画列表</h3>
        {animations.map((anim) => (
          <button
            key={anim.path}
            onClick={() => handleAnimationChange(anim.path)}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              background: currentAnimation === anim.path ? '#6366f1' : '#374151',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {anim.name}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            height: '4px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress * 100}%`,
              background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
              transition: 'width 0.1s ease',
            }}
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.9)',
            color: '#fff',
            fontSize: '24px',
          }}
        >
          加载中... {Math.round(loadState.progress)}%
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(139,0,0,0.9)',
            color: '#fff',
            fontSize: '18px',
            textAlign: 'center',
            padding: '40px',
          }}
        >
          <div>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <div>加载失败</div>
            <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
              {error.message}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

