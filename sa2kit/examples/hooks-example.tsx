/**
 * SA2Kit Hooks Example
 * 
 * This example demonstrates how to use SA2Kit hooks for fine-grained control
 * 
 * @example Using SA2Kit Hooks
 */

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  useMMDLoader,
  useMMDAnimation,
  useMMDCamera,
  MMDCameraControl,
} from 'sa2kit'

export default function HooksExample() {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const clockRef = useRef(new THREE.Clock())

  // State
  const [isSceneReady, setIsSceneReady] = useState(false)

  /**
   * Hook 1: useMMDLoader - Load MMD resources
   */
  const {
    loadState,
    progress,
    error,
    mesh,
    helper,
    audio,
    load,
  } = useMMDLoader({
    modelPath: '/models/miku.pmx',
    motionPath: '/motions/dance.vmd',
    audioPath: '/audio/music.mp3',
    enablePhysics: true,
    onLoad: () => console.log('✅ Resources loaded!'),
    onProgress: (p) => console.log(`⏳ Loading: ${p}%`),
    onError: (e) => console.error('❌ Error:', e),
  })

  /**
   * Hook 2: useMMDAnimation - Control animation
   */
  const {
    isPlaying,
    progress: animProgress,
    play,
    pause,
    stop,
    update: updateAnimation,
  } = useMMDAnimation({
    helper,
    mesh,
    audio,
    clock: clockRef.current,
    onPlay: () => console.log('▶️ Playing'),
    onPause: () => console.log('⏸️ Paused'),
    onStop: () => console.log('⏹️ Stopped'),
  })

  /**
   * Hook 3: useMMDCamera - Control camera
   */
  const {
    moveCamera,
    zoomCamera,
    elevateCamera,
    resetCamera,
  } = useMMDCamera({
    camera: cameraRef.current,
    controls: controlsRef.current,
    initialPosition: [0, 10, 25],
    initialTarget: [0, 8, 0],
  })

  /**
   * Initialize Three.js scene
   */
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xe8f4f8)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000)
    camera.position.set(0, 10, 25)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 1.0)
    scene.add(ambient)

    const directional = new THREE.DirectionalLight(0xffffff, 0.8)
    directional.position.set(1, 1, 1)
    scene.add(directional)

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0xd4e5f0 })
    )
    ground.rotation.x = -Math.PI / 2
    scene.add(ground)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 8, 0)
    controls.update()
    controlsRef.current = controls

    // Resize handler
    const handleResize = () => {
      if (!camera || !renderer) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    setIsSceneReady(true)

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Update animation using hook
      updateAnimation(clockRef.current.getDelta())

      // Update controls
      controls.update()

      // Render
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (renderer && container.contains(renderer.domElement)) {
        renderer.dispose()
        container.removeChild(renderer.domElement)
      }
      controls.dispose()
    }
  }, [updateAnimation])

  /**
   * Load MMD resources when scene is ready
   */
  useEffect(() => {
    if (isSceneReady && sceneRef.current && cameraRef.current) {
      load(sceneRef.current, cameraRef.current)
    }
  }, [isSceneReady, load])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Three.js container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Loading */}
      {loadState === 'loading' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>🎭</div>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>
            Loading...
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {Math.round(progress)}%
          </div>
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
            background: 'rgba(127, 29, 29, 0.9)',
            color: 'white',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <div style={{ fontSize: '20px' }}>{error.message}</div>
          </div>
        </div>
      )}

      {/* Camera control */}
      {loadState === 'success' && (
        <MMDCameraControl
          onCameraMove={moveCamera}
          onCameraZoom={zoomCamera}
          onCameraElevate={elevateCamera}
          onCameraReset={resetCamera}
        />
      )}

      {/* Animation controls */}
      {loadState === 'success' && (
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
          {!isPlaying ? (
            <button onClick={play} style={buttonStyle}>
              ▶️ Play
            </button>
          ) : (
            <button onClick={pause} style={buttonStyle}>
              ⏸️ Pause
            </button>
          )}
          <button onClick={stop} style={buttonStyle}>
            ⏹️ Stop
          </button>
        </div>
      )}

      {/* Progress indicator */}
      {isPlaying && (
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          {Math.round(animProgress * 100)}%
        </div>
      )}
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: 'white',
  border: 'none',
  borderRadius: '9999px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
  transition: 'all 0.2s',
}

