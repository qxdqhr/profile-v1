/**
 * SA2Kit Comprehensive Example
 * 
 * This example demonstrates the full capabilities of SA2Kit:
 * - MMDViewer with camera and animation controls
 * - MMDCameraControl UI component
 * - Hooks for fine-grained control
 * 
 * @example Complete MMD Scene with All Features
 */

import React, { useState, useEffect } from 'react'
import {
  MMDViewer,
  MMDCameraControl,
  useMMDCamera,
  type CameraControls,
  type AnimationControls,
} from 'sa2kit'

export default function ComprehensiveExample() {
  // State
  const [cameraControls, setCameraControls] = useState<CameraControls | null>(null)
  const [animationControls, setAnimationControls] = useState<AnimationControls | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* MMD Viewer */}
      <MMDViewer
        // Model
        modelPath="/models/YYB_Z6SakuraMiku/YYB Haku.pmx"
        texturePath="/models/YYB_Z6SakuraMiku"
        
        // Animation
        motionPath="/motions/wavefile_lat.vmd"
        autoPlay={false}
        
        // Scene
        backgroundColor="#e8f4f8"
        enableShadows
        showGround
        
        // Callbacks
        onLoad={() => {
          console.log('✅ MMD loaded successfully!')
          setIsLoading(false)
        }}
        onProgress={(progress) => {
          console.log(`⏳ Loading: ${progress}%`)
          setLoadProgress(progress)
        }}
        onError={(error) => {
          console.error('❌ Failed to load MMD:', error)
        }}
        onCameraReady={(controls) => {
          console.log('📷 Camera ready!')
          setCameraControls(controls)
        }}
        onAnimationReady={(controls) => {
          console.log('🎬 Animation ready!')
          setAnimationControls(controls)
        }}
      />

      {/* Camera Control UI */}
      {cameraControls && !isLoading && (
        <MMDCameraControl
          onCameraMove={cameraControls.moveCamera}
          onCameraZoom={cameraControls.zoomCamera}
          onCameraElevate={cameraControls.elevateCamera}
          onCameraReset={cameraControls.resetCamera}
          position="bottom-right"
          size="medium"
          theme="dark"
        />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            zIndex: 100,
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>🎭</div>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>
            Loading MMD Scene...
          </div>
          <div
            style={{
              width: '400px',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${loadProgress}%`,
                height: '100%',
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                transition: 'width 0.3s',
              }}
            />
          </div>
          <div style={{ marginTop: '8px', color: '#9ca3af' }}>
            {Math.round(loadProgress)}%
          </div>
        </div>
      )}

      {/* Animation controls */}
      {animationControls && !isLoading && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
            padding: '16px',
            borderRadius: '9999px',
          }}
        >
          <button
            onClick={animationControls.playAnimation}
            disabled={animationControls.isPlaying}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: animationControls.isPlaying
                ? '#6b7280'
                : 'linear-gradient(to bottom right, #10b981, #059669)',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: animationControls.isPlaying ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
            title="Play"
          >
            ▶️
          </button>
          <button
            onClick={animationControls.stopAnimation}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(to bottom right, #ef4444, #dc2626)',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title="Stop"
          >
            ⏹️
          </button>
        </div>
      )}

      {/* Info panel */}
      {!isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '14px',
            maxWidth: '300px',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold' }}>
            🎨 SA2Kit Demo
          </h3>
          <p style={{ margin: '0 0 8px 0' }}>
            ✅ Model loaded
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            📷 Camera controls: {cameraControls ? '✅' : '❌'}
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            🎬 Animation controls: {animationControls ? '✅' : '❌'}
          </p>
          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }} />
          <p style={{ margin: '0', fontSize: '12px', color: '#9ca3af' }}>
            Use the joystick to rotate the camera, zoom buttons to zoom in/out,
            and elevation buttons to move up/down.
          </p>
        </div>
      )}
    </div>
  )
}

