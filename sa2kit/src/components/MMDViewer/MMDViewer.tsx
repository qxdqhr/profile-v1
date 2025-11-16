/**
 * MMDViewer Component
 * 
 * A comprehensive MMD (MikuMikuDance) model viewer built on Three.js
 * 
 * @module sa2kit/components/MMDViewer
 * @author SA2Kit Team
 * @license MIT
 */

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MMDLoader, MMDAnimationHelper } from 'three-stdlib'

import type { MMDViewerProps, CameraControls, BoneState } from './types'
import { DEFAULT_VIEWER_CONFIG } from '../../constants/defaults'
import { TexturePathResolver } from '../../utils/texturePathResolver'

/**
 * ========================================
 * Logger Utility
 * ========================================
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
    if (this.shouldLog('debug')) console.log('[SA2Kit:MMDViewer]', ...args)
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) console.info('[SA2Kit:MMDViewer]', ...args)
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) console.warn('[SA2Kit:MMDViewer]', ...args)
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) console.error('[SA2Kit:MMDViewer]', ...args)
  }
}

/**
 * ========================================
 * Ammo.js Physics Engine Initialization
 * ========================================
 */

declare global {
  interface Window {
    Ammo: any
  }
}

let ammoInitialized = false
let ammoInitPromise: Promise<void> | null = null

/**
 * Initialize Ammo.js physics engine
 * 
 * @param jsPath - Path to ammo.wasm.js file
 * @param wasmPath - Path to ammo.wasm.wasm file
 * @returns Promise that resolves when Ammo.js is ready
 * @internal Reserved for future physics implementation
 */
// @ts-ignore - Reserved for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _initAmmo(jsPath: string, wasmPath: string): Promise<void> {
  if (ammoInitialized) return
  if (ammoInitPromise) return ammoInitPromise

  ammoInitPromise = new Promise(async (resolve, reject) => {
    try {
      if (typeof window !== 'undefined' && window.Ammo) {
        ammoInitialized = true
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = jsPath
      script.async = true

      script.onload = async () => {
        let retries = 0
        while (typeof (window as any).Ammo !== 'function' && retries < 50) {
          await new Promise(r => setTimeout(r, 100))
          retries++
        }

        if (typeof (window as any).Ammo !== 'function') {
          reject(new Error('Ammo function not defined'))
          return
        }

        try {
          const AmmoLib = await (window as any).Ammo({
            locateFile: (path: string) => {
              if (path.endsWith('.wasm')) return wasmPath
              return path
            }
          })

          window.Ammo = AmmoLib
          ammoInitialized = true
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      script.onerror = () => {
        reject(new Error('Failed to load Ammo.js'))
      }

      document.head.appendChild(script)
    } catch (error) {
      reject(error)
    }
  })

  return ammoInitPromise
}

/**
 * ========================================
 * MMDViewer Component
 * ========================================
 * 
 * A React component for displaying MMD models with full animation support.
 * 
 * Features:
 * - PMX/PMD model loading
 * - VMD animation playback
 * - Physics simulation (Ammo.js)
 * - Camera controls
 * - Texture path resolution
 * - Customizable scene settings
 * 
 * @example
 * ```tsx
 * <MMDViewer
 *   modelPath="/models/miku.pmx"
 *   backgroundColor={0xe8f4f8}
 *   onLoad={(model) => console.log('Model loaded', model)}
 * />
 * ```
 */
export const MMDViewer: React.FC<MMDViewerProps> = ({
  // Model config
  modelPath,
  texturePath,
  modelFileName = DEFAULT_VIEWER_CONFIG.modelFileName,

  // Scene config
  backgroundColor = DEFAULT_VIEWER_CONFIG.backgroundColor,
  enableFog = DEFAULT_VIEWER_CONFIG.enableFog,
  fogColor,
  enableShadows = DEFAULT_VIEWER_CONFIG.enableShadows,
  showGround = DEFAULT_VIEWER_CONFIG.showGround,
  groundColor = DEFAULT_VIEWER_CONFIG.groundColor,
  showGrid = DEFAULT_VIEWER_CONFIG.showGrid,

  // Camera config
  cameraPosition = DEFAULT_VIEWER_CONFIG.cameraPosition,
  cameraTarget = DEFAULT_VIEWER_CONFIG.cameraTarget,
  cameraFov = DEFAULT_VIEWER_CONFIG.cameraFov,
  enableCameraControls = DEFAULT_VIEWER_CONFIG.enableCameraControls,
  cameraMinDistance = DEFAULT_VIEWER_CONFIG.cameraMinDistance,
  cameraMaxDistance = DEFAULT_VIEWER_CONFIG.cameraMaxDistance,

  // Lighting config
  ambientLightIntensity = DEFAULT_VIEWER_CONFIG.ambientLightIntensity,
  directionalLightIntensity = DEFAULT_VIEWER_CONFIG.directionalLightIntensity,
  pointLightIntensity = DEFAULT_VIEWER_CONFIG.pointLightIntensity,

  // Model config
  targetModelSize = DEFAULT_VIEWER_CONFIG.targetModelSize,
  autoAdjustToGround = DEFAULT_VIEWER_CONFIG.autoAdjustToGround,

  // Animation config (optional)
  motionPath: _motionPath,
  cameraAnimationPath: _cameraAnimationPath,
  audioPath: _audioPath,
  autoPlay: _autoPlay = DEFAULT_VIEWER_CONFIG.autoPlay,

  // Physics config
  ammoJsPath: _ammoJsPath,
  ammoWasmPath: _ammoWasmPath,
  enablePhysics: _enablePhysics = true,
  enableIK: _enableIK = true,
  enableGrant: _enableGrant = true,
  enableGround: _enableGround = true,

  // Debug config
  debugMode = DEFAULT_VIEWER_CONFIG.debugMode,
  showStats: _showStats = DEFAULT_VIEWER_CONFIG.showStats,
  logLevel = DEFAULT_VIEWER_CONFIG.logLevel,

  // Callbacks
  onLoad,
  onProgress,
  onError,
  onCameraReady,
  onAnimationReady: _onAnimationReady,

  // Style
  className = '',
  style = {},
}) => {
  // Initialize logger with useRef to prevent recreation
  const loggerRef = useRef<Logger>()
  if (!loggerRef.current) {
    loggerRef.current = new Logger(logLevel, debugMode || logLevel !== 'none')
  }
  const logger = loggerRef.current

  // ========================================
  // Refs
  // ========================================
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const helperRef = useRef<MMDAnimationHelper | null>(null)
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const frameCountRef = useRef<number>(0)
  const initialBonesStateRef = useRef<Map<string, BoneState>>(new Map())
  const hasLoadedRef = useRef<boolean>(false)

  // ========================================
  // State
  // ========================================
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)

  /**
   * ========================================
   * Initialize Three.js Scene
   * ========================================
   */
  const initThreeJS = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    logger.info('Initializing Three.js scene')

    // Create scene
    const scene = new THREE.Scene()
    const bgColor = typeof backgroundColor === 'number' ? backgroundColor : parseInt(backgroundColor.replace('#', ''), 16)
    scene.background = new THREE.Color(bgColor)

    if (enableFog) {
      const fColor = fogColor !== undefined 
        ? (typeof fogColor === 'number' ? fogColor : parseInt(fogColor.replace('#', ''), 16))
        : bgColor
      scene.fog = new THREE.Fog(fColor, 20, 100)
    }

    sceneRef.current = scene

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      cameraFov!,
      width / height,
      0.1,
      1000
    )
    camera.position.set(...cameraPosition!)
    cameraRef.current = camera

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = enableShadows!
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity)
    scene.add(ambientLight)

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, directionalLightIntensity)
    directionalLight1.position.set(20, 30, 20)
    directionalLight1.castShadow = enableShadows!
    directionalLight1.shadow.mapSize.width = 2048
    directionalLight1.shadow.mapSize.height = 2048
    scene.add(directionalLight1)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, directionalLightIntensity! * 0.625)
    directionalLight2.position.set(-20, 20, -20)
    scene.add(directionalLight2)

    const pointLight = new THREE.PointLight(0xffffff, pointLightIntensity, 50)
    pointLight.position.set(0, 15, 10)
    scene.add(pointLight)

    // Ground
    if (showGround) {
      const groundGeometry = new THREE.CircleGeometry(30, 32)
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: groundColor,
        roughness: 0.8,
        metalness: 0.2,
      })
      const ground = new THREE.Mesh(groundGeometry, groundMaterial)
      ground.rotation.x = -Math.PI / 2
      ground.receiveShadow = enableShadows!
      scene.add(ground)
    }

    // Grid helper (optional)
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(60, 60, 0xcccccc, 0xe0e0e0)
      gridHelper.position.y = 0.01
      scene.add(gridHelper)
    }

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(...cameraTarget!)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = cameraMinDistance!
    controls.maxDistance = cameraMaxDistance!
    controls.maxPolarAngle = Math.PI / 2
    controls.enabled = enableCameraControls!
    controlsRef.current = controls

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      if (controlsRef.current) {
        controlsRef.current.update()
      }

      if (helperRef.current) {
        const delta = clockRef.current.getDelta()
        helperRef.current.update(delta)

        frameCountRef.current++
        if (debugMode && frameCountRef.current % 120 === 0) {
          const helper = helperRef.current as any
          logger.debug('Physics system status:', {
            frame: frameCountRef.current,
            delta: delta.toFixed(4),
            physicsEnabled: !!helper.physics,
            objectCount: helper.objects?.size || 0
          })
        }
      }

      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
    animate()

    // Expose camera controls
    if (onCameraReady) {
      const controls: CameraControls = {
        moveCamera: (deltaX: number, deltaY: number) => {
          if (controlsRef.current && cameraRef.current) {
            const camera = cameraRef.current
            const target = controlsRef.current.target
            const offset = new THREE.Vector3().subVectors(camera.position, target)
            const spherical = new THREE.Spherical().setFromVector3(offset)

            spherical.theta -= deltaX
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - deltaY))

            offset.setFromSpherical(spherical)
            camera.position.copy(target).add(offset)
            controlsRef.current.update()
          }
        },
        zoomCamera: (delta: number) => {
          if (cameraRef.current && controlsRef.current) {
            const distance = cameraRef.current.position.distanceTo(controlsRef.current.target)
            const newDistance = Math.max(cameraMinDistance!, Math.min(cameraMaxDistance!, distance + delta * 10))

            const direction = new THREE.Vector3()
            direction.subVectors(cameraRef.current.position, controlsRef.current.target).normalize()
            cameraRef.current.position.copy(controlsRef.current.target).add(direction.multiplyScalar(newDistance))
          }
        },
        elevateCamera: (delta: number) => {
          if (cameraRef.current && controlsRef.current) {
            const elevationAmount = delta * 2
            cameraRef.current.position.z += elevationAmount
            controlsRef.current.target.z += elevationAmount
            controlsRef.current.update()
          }
        },
        resetCamera: () => {
          if (cameraRef.current && controlsRef.current) {
            cameraRef.current.position.set(...cameraPosition!)
            controlsRef.current.target.set(...cameraTarget!)
            controlsRef.current.update()
          }
        }
      }

      onCameraReady(controls)
    }
  }, [
    backgroundColor, enableFog, fogColor, enableShadows, showGround, groundColor, showGrid,
    cameraPosition, cameraTarget, cameraFov, enableCameraControls, cameraMinDistance, cameraMaxDistance,
    ambientLightIntensity, directionalLightIntensity, pointLightIntensity,
    debugMode, onCameraReady
  ])

  /**
   * ========================================
   * Load PMX/PMD Model
   * ========================================
   */
  const loadModel = useCallback(async () => {
    if (!sceneRef.current) {
      logger.error('Scene not initialized')
      return
    }

    setLoading(true)
    setError(null)
    setLoadingProgress(10)

    try {
      logger.info('Loading MMD model:', modelPath)

      // Create texture path resolver
      const basePath = texturePath || modelPath.substring(0, modelPath.lastIndexOf('/'))
      const textureResolver = new TexturePathResolver({
        basePath,
        modelPath,
        debug: debugMode
      })

      // Create loading manager with texture path resolution
      const manager = new THREE.LoadingManager()
      manager.setURLModifier((url) => {
        const resolved = textureResolver.resolve(url)
        if (url !== resolved && debugMode) {
          logger.debug('Texture URL resolved:', url, '->', resolved)
        }
        return resolved
      })

      const loader = new MMDLoader(manager)
      // 只为相对路径设置 resourcePath，绝对路径不需要
      if (!basePath.startsWith('/') && !basePath.startsWith('http')) {
        loader.setResourcePath(basePath + '/')
      }

      setLoadingProgress(40)

      const fullModelPath = modelFileName ? `${modelPath}/${modelFileName}` : modelPath
      logger.debug('Full model path:', fullModelPath)

      // Load model
      const mesh = await loader.loadAsync(fullModelPath, (progress) => {
        const percent = (progress.loaded / progress.total) * 40 + 40
        setLoadingProgress(Math.min(percent, 80))
        onProgress?.(Math.min(percent, 80))
      })

      // Clean up deprecated material properties
      mesh.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((mat: any) => {
            if (mat.isMeshToonMaterial && 'combine' in mat) {
              delete mat.combine
            }
            const deprecatedProps = ['combine', 'reflectivity', 'refractionRatio']
            deprecatedProps.forEach(prop => {
              if (prop in mat && mat[prop] !== undefined) {
                delete mat[prop]
              }
            })
          })
        }
      })

      setLoadingProgress(80)

      // Remove old model
      if (modelRef.current) {
        sceneRef.current.remove(modelRef.current)
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose())
            } else {
              child.material.dispose()
            }
          }
        })
      }

      // Create model group
      const modelGroup = new THREE.Group()
      modelGroup.add(mesh)

      // Adjust model position and scale
      const box = new THREE.Box3().setFromObject(modelGroup)
      const size = box.getSize(new THREE.Vector3())

      if (autoAdjustToGround) {
        modelGroup.position.y = -box.min.y
      }

      const maxDimension = Math.max(size.x, size.y, size.z)
      if (maxDimension > 0 && targetModelSize) {
        const scale = targetModelSize / maxDimension
        modelGroup.scale.set(scale, scale, scale)
      }

      sceneRef.current.add(modelGroup)
      modelRef.current = modelGroup

      // Save initial bone states
      modelGroup.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh && child.skeleton) {
          child.skeleton.bones.forEach((bone, index) => {
            const key = `${child.uuid}_bone_${index}`
            initialBonesStateRef.current.set(key, {
              position: bone.position.clone(),
              quaternion: bone.quaternion.clone(),
              scale: bone.scale.clone()
            })
          })
        }
      })
      logger.debug('Saved initial bone states:', initialBonesStateRef.current.size)

      setLoadingProgress(100)
      setLoading(false)
      logger.info('Model loaded successfully')
      onLoad?.(modelGroup)
      onProgress?.(100)

    } catch (err) {
      logger.error('Model loading failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load model'
      setError(errorMessage)
      setLoading(false)
      onError?.(err as Error)
    }
  }, [
    modelPath, texturePath, modelFileName, debugMode, autoAdjustToGround, targetModelSize,
    onLoad, onProgress, onError
  ])

  /**
   * ========================================
   * Handle window resize
   * ========================================
   */
  const handleResize = useCallback(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    cameraRef.current.aspect = width / height
    cameraRef.current.updateProjectionMatrix()
    rendererRef.current.setSize(width, height)
  }, [])

  /**
   * ========================================
   * Component lifecycle
   * ========================================
   */
  useEffect(() => {
    initThreeJS()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      // Cleanup
      if (helperRef.current) {
        if (modelRef.current) {
          modelRef.current.traverse((child) => {
            if (child instanceof THREE.SkinnedMesh) {
              try { helperRef.current?.remove(child) } catch (e) { }
            }
          })
        }
        if (cameraRef.current) {
          try { helperRef.current.remove(cameraRef.current) } catch (e) { }
        }
        helperRef.current = null
      }

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (modelRef.current && sceneRef.current) {
        sceneRef.current.remove(modelRef.current)
      }

      if (controlsRef.current) {
        controlsRef.current.dispose()
      }

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [initThreeJS, handleResize])

  // Reset loading flag when modelPath changes
  useEffect(() => {
    hasLoadedRef.current = false
  }, [modelPath])

  // Load model after scene is initialized
  useEffect(() => {
    if (sceneRef.current && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      const timer = setTimeout(() => {
        loadModel()
      }, 100)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [loadModel])

  /**
   * ========================================
   * Render
   * ========================================
   */
  return (
    <div ref={containerRef} className={`sa2kit-mmd-viewer ${className}`} style={{ width: '100%', height: '100%', position: 'relative', ...style }}>
      {/* Loading overlay */}
      {loading && (
        <div className="sa2kit-loading-overlay" style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, rgba(224, 247, 250, 0.9), rgba(224, 242, 255, 0.9))',
          backdropFilter: 'blur(4px)',
          zIndex: 10
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid rgb(191, 219, 254)',
              borderTopColor: 'rgb(59, 130, 246)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }}></div>
            <div style={{ fontSize: '18px', fontWeight: 500, color: 'rgb(55, 65, 81)', marginBottom: '8px' }}>
              Loading model...
            </div>
            <div style={{ fontSize: '14px', color: 'rgb(107, 114, 128)' }}>
              {loadingProgress.toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="sa2kit-error-overlay" style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(254, 242, 242, 0.9)',
          backdropFilter: 'blur(4px)',
          zIndex: 10
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            padding: '24px',
            maxWidth: '448px',
            margin: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'rgb(220, 38, 38)', marginBottom: '8px' }}>
              Loading Failed
            </div>
            <div style={{ fontSize: '14px', color: 'rgb(75, 85, 99)', marginBottom: '16px' }}>{error}</div>
            <button
              onClick={() => {
                setError(null)
                loadModel()
              }}
              style={{
                padding: '8px 16px',
                background: 'rgb(59, 130, 246)',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgb(37, 99, 235)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgb(59, 130, 246)'}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Control hint */}
      {!loading && !error && enableCameraControls && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          fontSize: '12px',
          padding: '6px 12px',
          borderRadius: '8px',
          pointerEvents: 'none',
          opacity: 0.6
        }}>
          Left: Rotate | Scroll: Zoom | Right: Pan
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

MMDViewer.displayName = 'MMDViewer'

export default MMDViewer

