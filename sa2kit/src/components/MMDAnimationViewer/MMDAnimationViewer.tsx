/**
 * MMDAnimationViewer Component
 * 
 * 完整的 MMD 动画查看器，集成模型加载和动画播放
 * 
 * @module sa2kit/components/MMDAnimationViewer
 * @author SA2Kit Team
 * @license MIT
 */

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MMDLoader, MMDAnimationHelper } from 'three-stdlib'

import type { MMDAnimationViewerProps, AnimationViewerState, PlaybackControlsExtended } from './types'
import { DEFAULT_ANIMATION_VIEWER_CONFIG } from '../../constants/animationDefaults'
import { TexturePathResolver } from '../../utils/texturePathResolver'

/**
 * Ammo.js Physics Engine
 */
declare global {
  interface Window {
    Ammo: any
  }
}

let ammoInitialized = false
let ammoInitPromise: Promise<void> | null = null

async function initAmmo(jsPath: string, wasmPath: string): Promise<void> {
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
 * Logger
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
    if (this.shouldLog('debug')) console.log('[SA2Kit:AnimationViewer]', ...args)
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) console.info('[SA2Kit:AnimationViewer]', ...args)
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) console.warn('[SA2Kit:AnimationViewer]', ...args)
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) console.error('[SA2Kit:AnimationViewer]', ...args)
  }
}

/**
 * MMDAnimationViewer Component
 * 
 * 完整的 MMD 动画播放器，包含模型加载、动画播放、音频同步等功能
 * 
 * @example
 * ```tsx
 * <MMDAnimationViewer
 *   modelPath="/models/miku.pmx"
 *   motionPath="/animations/dance.vmd"
 *   audioPath="/audio/music.mp3"
 *   autoPlay={true}
 *   onReady={(controls) => {
 *     console.log('准备就绪')
 *   }}
 * />
 * ```
 */
export const MMDAnimationViewer: React.FC<MMDAnimationViewerProps> = ({
  // Model config
  modelPath,
  texturePath,
  modelFileName = '',
  
  // Animation config
  motionPath,
  cameraMotionPath,
  audioPath,
  
  // Scene config
  backgroundColor = DEFAULT_ANIMATION_VIEWER_CONFIG.backgroundColor,
  enableFog = DEFAULT_ANIMATION_VIEWER_CONFIG.enableFog,
  fogColor,
  enableShadows = DEFAULT_ANIMATION_VIEWER_CONFIG.enableShadows,
  showGround = DEFAULT_ANIMATION_VIEWER_CONFIG.showGround,
  groundColor = DEFAULT_ANIMATION_VIEWER_CONFIG.groundColor,
  showGrid = DEFAULT_ANIMATION_VIEWER_CONFIG.showGrid,
  
  // Camera config
  cameraPosition = DEFAULT_ANIMATION_VIEWER_CONFIG.cameraPosition,
  cameraTarget = DEFAULT_ANIMATION_VIEWER_CONFIG.cameraTarget,
  cameraFov = DEFAULT_ANIMATION_VIEWER_CONFIG.cameraFov,
  enableCameraControls = DEFAULT_ANIMATION_VIEWER_CONFIG.enableCameraControls,
  
  // Lighting
  ambientLightIntensity = DEFAULT_ANIMATION_VIEWER_CONFIG.ambientLightIntensity,
  directionalLightIntensity = DEFAULT_ANIMATION_VIEWER_CONFIG.directionalLightIntensity,
  
  // Playback
  autoPlay = false,
  loop = false,
  volume = 0.7,
  
  // Physics
  enablePhysics = true,
  enableIK = true,
  enableGrant = true,
  ammoJsPath,
  ammoWasmPath,
  
  // Debug
  debugMode = false,
  logLevel = 'warn',
  
  // Callbacks
  onReady,
  onPlay,
  onPause,
  onStop,
  onProgress,
  onEnd,
  onError,
  onLoad,
  
  // Style
  className = '',
  style = {},
}) => {
  // Initialize logger
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
  const modelRef = useRef<THREE.SkinnedMesh | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const helperRef = useRef<MMDAnimationHelper | null>(null)
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationDurationRef = useRef<number>(0)
  const progressIntervalRef = useRef<number | null>(null)
  const hasLoadedRef = useRef<boolean>(false)
  const initialBonesStateRef = useRef<Map<string, { position: THREE.Vector3, quaternion: THREE.Quaternion }> | null>(null)
  const initialMorphTargetsRef = useRef<Float32Array | null>(null)
  const initialModelTransformRef = useRef<{ position: THREE.Vector3, rotation: THREE.Euler, quaternion: THREE.Quaternion } | null>(null)
  // 保存所有子对象的状态（包括头饰、衣服等）- 使用 uuid 而不是 id 来确保稳定性
  const initialChildrenStateRef = useRef<Map<string, { position: THREE.Vector3, rotation: THREE.Euler, quaternion: THREE.Quaternion, scale: THREE.Vector3 }> | null>(null)
  
  // Callback refs to avoid dependency changes
  const onLoadRef = useRef(onLoad)
  const onErrorRef = useRef(onError)
  const onReadyRef = useRef(onReady)
  const onPlayRef = useRef(onPlay)
  const onPauseRef = useRef(onPause)
  const onStopRef = useRef(onStop)
  const onProgressRef = useRef(onProgress)
  const onEndRef = useRef(onEnd)
  
  // Update refs when callbacks change
  useEffect(() => {
    onLoadRef.current = onLoad
    onErrorRef.current = onError
    onReadyRef.current = onReady
    onPlayRef.current = onPlay
    onPauseRef.current = onPause
    onStopRef.current = onStop
    onProgressRef.current = onProgress
    onEndRef.current = onEnd
  }, [onLoad, onError, onReady, onPlay, onPause, onStop, onProgress, onEnd])

  // ========================================
  // State
  // ========================================
  const [state, setState] = useState<AnimationViewerState>({
    modelLoading: false,
    modelLoaded: false,
    animationLoading: false,
    animationLoaded: false,
    isPlaying: false,
    progress: 0,
    loadProgress: 0,
    error: null,
  })
  
  const stateRef = useRef(state)
  
  // Sync state to ref for controls
  useEffect(() => {
    stateRef.current = state
  }, [state])

  /**
   * Initialize Three.js Scene (only once)
   */
  const initThreeJS = useCallback(() => {
    logger.info('initThreeJS called', {
      hasContainer: !!containerRef.current,
      hasScene: !!sceneRef.current,
      hasRenderer: !!rendererRef.current
    })

    if (!containerRef.current) {
      logger.error('initThreeJS: containerRef is null')
      return
    }

    // Don't skip if scene exists but renderer doesn't - need to reinitialize
    if (sceneRef.current && rendererRef.current && rendererRef.current.domElement.parentElement) {
      logger.info('initThreeJS: scene and renderer already initialized and attached, skipping')
      return
    }

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Clean up old resources if they exist
    if (rendererRef.current) {
      logger.info('Cleaning up old renderer')
      if (rendererRef.current.domElement.parentElement) {
        rendererRef.current.domElement.parentElement.removeChild(rendererRef.current.domElement)
      }
      rendererRef.current.dispose()
      rendererRef.current = null
    }

    if (controlsRef.current) {
      logger.info('Cleaning up old controls')
      controlsRef.current.dispose()
      controlsRef.current = null
    }

    logger.info('Initializing Three.js scene', {
      backgroundColor,
      ambientLightIntensity,
      directionalLightIntensity,
      containerSize: { width, height }
    })

    // Create scene
    const scene = new THREE.Scene()
    const bgColor = typeof backgroundColor === 'number' ? backgroundColor : parseInt(backgroundColor.replace('#', ''), 16)
    scene.background = new THREE.Color(bgColor)
    logger.debug('Scene created with background color:', bgColor)

    if (enableFog) {
      const fColor = fogColor !== undefined 
        ? (typeof fogColor === 'number' ? fogColor : parseInt(fogColor.replace('#', ''), 16))
        : bgColor
      scene.fog = new THREE.Fog(fColor, 20, 100)
    }

    sceneRef.current = scene

    // Create camera
    const camera = new THREE.PerspectiveCamera(cameraFov, width / height, 0.1, 1000)
    camera.position.set(...cameraPosition)
    cameraRef.current = camera

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = enableShadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity)
    scene.add(ambientLight)
    logger.debug('Added ambient light with intensity:', ambientLightIntensity)

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, directionalLightIntensity)
    directionalLight1.position.set(20, 30, 20)
    directionalLight1.castShadow = enableShadows
    scene.add(directionalLight1)
    logger.debug('Added directional light 1 with intensity:', directionalLightIntensity)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, directionalLightIntensity * 0.625)
    directionalLight2.position.set(-20, 20, -20)
    scene.add(directionalLight2)
    logger.debug('Added directional light 2 with intensity:', directionalLightIntensity * 0.625)

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
      ground.receiveShadow = enableShadows
      scene.add(ground)
    }

    // Grid
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(60, 60, 0xcccccc, 0xe0e0e0)
      gridHelper.position.y = 0.01
      scene.add(gridHelper)
    }

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(...cameraTarget)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 5
    controls.maxDistance = 100
    controls.maxPolarAngle = Math.PI / 2
    controls.enabled = enableCameraControls
    controlsRef.current = controls

    // Animation loop
    let frameCount = 0
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      if (controlsRef.current) {
        controlsRef.current.update()
      }

      if (helperRef.current) {
        const delta = clockRef.current.getDelta()
        helperRef.current.update(delta)
      }

      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
        
        // Log every 60 frames (about 1 second at 60fps)
        if (frameCount % 60 === 0) {
          logger.debug('Render frame', {
            sceneChildren: sceneRef.current.children.length,
            cameraPosition: cameraRef.current.position,
            modelInScene: modelRef.current ? 'yes' : 'no'
          })
        }
        frameCount++
      }
    }
    animate()
    logger.info('Animation loop started')
  }, [backgroundColor, ambientLightIntensity, directionalLightIntensity, enableFog, fogColor, enableShadows, showGround, groundColor, showGrid, cameraPosition, cameraTarget, cameraFov, enableCameraControls])

  /**
   * Load Model
   */
  const loadModel = useCallback(async () => {
    if (!sceneRef.current) return

    try {
      setState(prev => ({ ...prev, modelLoading: true, loadProgress: 0 }))
      logger.info('Loading model:', modelPath)

      const basePath = texturePath || modelPath.substring(0, modelPath.lastIndexOf('/'))
      const textureResolver = new TexturePathResolver({
        basePath,
        modelPath,
        debug: debugMode
      })

      const manager = new THREE.LoadingManager()
      manager.setURLModifier((url) => textureResolver.resolve(url))

      const loader = new MMDLoader(manager)
      if (!basePath.startsWith('/') && !basePath.startsWith('http')) {
        loader.setResourcePath(basePath + '/')
      }

      const fullModelPath = modelFileName ? `${modelPath}/${modelFileName}` : modelPath
      
      const mesh = await loader.loadAsync(fullModelPath, (progress) => {
        const percent = (progress.loaded / progress.total) * 50
        setState(prev => ({ ...prev, loadProgress: Math.min(percent, 50) }))
      })

      // Clean up materials
      mesh.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((mat: any) => {
            const deprecatedProps = ['combine', 'reflectivity', 'refractionRatio']
            deprecatedProps.forEach(prop => {
              if (prop in mat && mat[prop] !== undefined) {
                delete mat[prop]
              }
            })
          })
        }
      })

      // Adjust model position
      const box = new THREE.Box3().setFromObject(mesh)
      mesh.position.y = -box.min.y

      sceneRef.current.add(mesh)
      modelRef.current = mesh

      // 保存初始骨骼姿势（用于停止时恢复）
      if (mesh.skeleton && mesh.skeleton.bones) {
        const initialState = new Map<string, { position: THREE.Vector3, quaternion: THREE.Quaternion }>()
        mesh.skeleton.bones.forEach(bone => {
          initialState.set(bone.name, {
            position: bone.position.clone(),
            quaternion: bone.quaternion.clone()
          })
        })
        initialBonesStateRef.current = initialState
        logger.debug('Initial bone states saved, bone count:', initialState.size)
      }

      // 保存初始表情状态（morphTargetInfluences）
      if (mesh.morphTargetInfluences && mesh.morphTargetInfluences.length > 0) {
        initialMorphTargetsRef.current = new Float32Array(mesh.morphTargetInfluences)
        logger.debug('Initial morph targets saved, morph count:', mesh.morphTargetInfluences.length)
      }

      // 保存模型根对象的初始变换状态（位置、旋转）
      initialModelTransformRef.current = {
        position: mesh.position.clone(),
        rotation: mesh.rotation.clone(),
        quaternion: mesh.quaternion.clone()
      }
      logger.debug('Initial model transform saved', {
        position: mesh.position.toArray(),
        rotation: mesh.rotation.toArray(),
        quaternion: mesh.quaternion.toArray()
      })

      // 递归保存所有子对象的状态（头饰、衣服等）- 使用 uuid 确保对象标识稳定
      const childrenState = new Map<string, { position: THREE.Vector3, rotation: THREE.Euler, quaternion: THREE.Quaternion, scale: THREE.Vector3 }>()
      let childCount = 0
      mesh.traverse((child) => {
        // 保存每个子对象的变换状态,使用 uuid 作为唯一标识
        childrenState.set(child.uuid, {
          position: child.position.clone(),
          rotation: child.rotation.clone(),
          quaternion: child.quaternion.clone(),
          scale: child.scale.clone()
        })
        childCount++
      })
      initialChildrenStateRef.current = childrenState
      logger.debug(`Initial children states saved, count: ${childCount}`)

      logger.info('Model loaded and added to scene', {
        position: mesh.position,
        boundingBox: { min: box.min, max: box.max },
        sceneChildren: sceneRef.current.children.length,
        meshVisible: mesh.visible,
        boneCount: mesh.skeleton?.bones?.length || 0,
        morphTargetCount: mesh.morphTargetInfluences?.length || 0,
        totalChildrenCount: childCount
      })

      setState(prev => ({ ...prev, modelLoading: false, modelLoaded: true, loadProgress: 50 }))
      logger.info('Model loaded successfully')
      onLoadRef.current?.()

      // Load animation
      await loadAnimation()

    } catch (error) {
      logger.error('Model loading failed:', error)
      const err = error instanceof Error ? error : new Error('Failed to load model')
      setState(prev => ({ ...prev, modelLoading: false, error: err }))
      onErrorRef.current?.(err)
    }
    // Note: loadAnimation is used but not in deps to avoid circular dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelPath, texturePath, modelFileName, debugMode])

  /**
   * Load Animation
   */
  const loadAnimation = useCallback(async () => {
    if (!modelRef.current) return

    try {
      setState(prev => ({ ...prev, animationLoading: true, loadProgress: 50 }))
      logger.info('Loading animation')

      // Initialize Ammo.js if physics enabled
      if (enablePhysics && ammoJsPath && ammoWasmPath) {
        try {
          logger.debug('Initializing Ammo.js...')
          await initAmmo(ammoJsPath, ammoWasmPath)
          logger.debug('Ammo.js initialized successfully')
        } catch (error) {
          logger.warn('Ammo.js initialization failed, physics will be disabled:', error)
          // Continue without physics rather than failing completely
        }
      } else if (enablePhysics) {
        logger.warn('Physics enabled but ammo paths not provided, physics will be disabled')
      }

      const loader = new MMDLoader()
      const helper = new MMDAnimationHelper()
      helperRef.current = helper
      
      // 默认禁用所有动画，等待用户播放
      helper.enable('animation', false)
      helper.enable('ik', false)
      helper.enable('grant', false)
      helper.enable('physics', false)

      // Load motion
      if (motionPath) {
        logger.debug('Loading motion:', motionPath)
        
        // 使用 loadAnimation 加载 VMD 文件
        const motion = await new Promise<any>((resolve, reject) => {
          loader.loadAnimation(motionPath, modelRef.current!, (vmd) => {
            setState(prev => ({ ...prev, loadProgress: 75 }))
            resolve(vmd)
          }, (progress) => {
            const percent = (progress.loaded / progress.total) * 25 + 50
            setState(prev => ({ ...prev, loadProgress: Math.min(percent, 75) }))
          }, reject)
        })

        helper.add(modelRef.current, {
          animation: motion,
          physics: enablePhysics,
        })

        logger.debug('Motion loaded')
      }

      // Load camera motion
      if (cameraMotionPath && cameraRef.current) {
        logger.debug('Loading camera motion:', cameraMotionPath)
        
        // 使用 loadAnimation 加载相机 VMD 文件
        const cameraMotion = await new Promise<any>((resolve, reject) => {
          loader.loadAnimation(cameraMotionPath, cameraRef.current!, (vmd) => {
            resolve(vmd)
          }, undefined, reject)
        })
        
        helper.add(cameraRef.current, {
          animation: cameraMotion,
        })

        logger.debug('Camera motion loaded')
      }

      // Load audio
      if (audioPath) {
        logger.debug('Loading audio:', audioPath)
        const audio = new Audio(audioPath)
        audio.volume = volume
        audio.loop = loop
        
        // Wait for audio metadata to load to get duration
        await new Promise<void>((resolve, reject) => {
          audio.onloadedmetadata = () => {
            animationDurationRef.current = audio.duration
            logger.debug('Audio metadata loaded, duration:', audio.duration)
            resolve()
          }
          
          audio.onerror = (e) => {
            logger.error('Audio loading error:', e)
            reject(e)
          }
          
          // Start loading
          audio.load()
        })
        
        audio.onended = () => {
          if (!loop) {
            setState(prev => ({ ...prev, isPlaying: false, progress: 0 }))
            onEndRef.current?.()
            logger.info('Animation ended')
          }
        }

        audioRef.current = audio
        logger.debug('Audio loaded successfully, duration:', animationDurationRef.current)
      }

      setState(prev => ({ ...prev, animationLoading: false, animationLoaded: true, loadProgress: 100 }))
      logger.info('Animation loaded successfully')

      // Call onReady with controls
      if (onReadyRef.current) {
        onReadyRef.current(createControls())
      }

      // Auto play
      if (autoPlay) {
        setTimeout(() => play(), 100)
      }

    } catch (error) {
      logger.error('Animation loading failed:', error)
      const err = error instanceof Error ? error : new Error('Failed to load animation')
      setState(prev => ({ ...prev, animationLoading: false, error: err }))
      onErrorRef.current?.(err)
    }
    // Note: play and createControls are used but not in deps to avoid circular dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionPath, cameraMotionPath, audioPath, enablePhysics, enableIK, enableGrant, ammoJsPath, ammoWasmPath, volume, loop, autoPlay])

  /**
   * Playback Controls
   */
  const play = useCallback(async () => {
    logger.info('Play called', {
      hasHelper: !!helperRef.current,
      hasModel: !!modelRef.current,
      hasAudio: !!audioRef.current,
      currentState: stateRef.current,
      audioCurrentTime: audioRef.current?.currentTime
    })

    if (!helperRef.current) {
      logger.error('Cannot play: helperRef is null')
      return
    }

    // 如果音频在开始位置（刚加载或刚停止），从头播放
    if (audioRef.current && audioRef.current.currentTime === 0) {
      logger.info('Starting playback from beginning')
    }

    logger.info('Playing animation')

    helperRef.current.enable('animation', true)
    helperRef.current.enable('ik', enableIK)
    helperRef.current.enable('grant', enableGrant)
    helperRef.current.enable('physics', enablePhysics)

    if (audioRef.current) {
      try {
        logger.info('Attempting to play audio', {
          currentTime: audioRef.current.currentTime,
          duration: audioRef.current.duration,
          volume: audioRef.current.volume,
          paused: audioRef.current.paused,
          readyState: audioRef.current.readyState,
          src: audioRef.current.src
        })
        
        const playPromise = audioRef.current.play()
        await playPromise
        
        logger.info('Audio playback started successfully', {
          currentTime: audioRef.current.currentTime,
          duration: audioRef.current.duration
        })
      } catch (error) {
        logger.error('Audio playback error:', error)
        // 如果是浏览器自动播放策略阻止，提示用户
        if (error instanceof Error && error.name === 'NotAllowedError') {
          logger.warn('Audio autoplay was blocked by browser. User interaction is required.')
          alert('音频播放被浏览器阻止，请点击播放按钮开始播放')
        }
      }
    } else {
      logger.warn('No audio available for playback')
    }

    setState(prev => ({ ...prev, isPlaying: true }))
    onPlayRef.current?.()
    logger.info('Play state updated')

    // Progress tracking
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    progressIntervalRef.current = window.setInterval(() => {
      if (audioRef.current && animationDurationRef.current > 0) {
        const currentProgress = audioRef.current.currentTime / animationDurationRef.current
        setState(prev => ({ ...prev, progress: currentProgress }))
        onProgressRef.current?.(currentProgress)
      }
    }, 100)
  }, [enableIK, enableGrant, enablePhysics])

  const pause = useCallback(() => {
    logger.info('Pausing animation (keeping current position)')

    // 禁用动画但保持当前状态
    if (helperRef.current) {
      helperRef.current.enable('animation', false)
      helperRef.current.enable('ik', false)
      helperRef.current.enable('grant', false)
      helperRef.current.enable('physics', false)
    }

    // 暂停音频但保持当前时间
    if (audioRef.current) {
      audioRef.current.pause()
      logger.debug('Audio paused at time:', audioRef.current.currentTime)
    }

    setState(prev => ({ ...prev, isPlaying: false }))
    onPauseRef.current?.()

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    
    logger.info('Animation paused')
  }, [])

  const stop = useCallback(() => {
    logger.info('Stopping animation and resetting to initial state')

    // 暂停音频到起始位置
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // 清除进度更新定时器
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }

    // 重置动画到初始状态
    if (helperRef.current && modelRef.current) {
      // 重置 clock
      if (clockRef.current) {
        clockRef.current.stop()
        clockRef.current.start()
        logger.debug('Clock reset')
      }
      
      // 恢复保存的初始骨骼姿势
      if (initialBonesStateRef.current && modelRef.current.skeleton) {
        const bones = modelRef.current.skeleton.bones
        let restoredCount = 0
        
        bones.forEach(bone => {
          const initialState = initialBonesStateRef.current!.get(bone.name)
          if (initialState) {
            bone.position.copy(initialState.position)
            bone.quaternion.copy(initialState.quaternion)
            
            // 标记骨骼需要更新
            bone.matrixAutoUpdate = true
            bone.updateMatrix()
            
            restoredCount++
          }
        })
        
        logger.debug(`Restored ${restoredCount} bones to initial state`)
        
        // 强制更新整个骨骼系统
        if (modelRef.current.skeleton) {
          // 更新所有骨骼的世界矩阵
          bones.forEach(bone => {
            bone.updateMatrixWorld(true)
          })
          
          // 更新骨骼系统
          modelRef.current.skeleton.update()
          
          logger.debug('Skeleton system fully updated')
        }
      } else {
        logger.warn('No initial bone states saved, trying mixer reset')
        
        // 如果没有保存的初始状态，尝试使用mixer重置（备用方案）
        const mixer = (helperRef.current as any).objects?.get(modelRef.current)?.mixer
        
        if (mixer) {
          const actions = mixer._actions || []
          for (const action of actions) {
            action.stop()
            action.time = 0
            action.play()
            action.paused = true
          }
          
          mixer.time = 0
          mixer.update(0)
          
          logger.debug('Mixer reset as fallback')
        }
      }
      
      // 恢复保存的初始表情状态（morphTargetInfluences）
      if (initialMorphTargetsRef.current && modelRef.current.morphTargetInfluences) {
        for (let i = 0; i < initialMorphTargetsRef.current.length; i++) {
          modelRef.current.morphTargetInfluences[i] = initialMorphTargetsRef.current[i]
        }
        logger.debug(`Restored ${initialMorphTargetsRef.current.length} morph targets to initial state`)
      }
      
      // 恢复模型根对象的初始变换状态
      if (initialModelTransformRef.current && modelRef.current) {
        modelRef.current.position.copy(initialModelTransformRef.current.position)
        modelRef.current.rotation.copy(initialModelTransformRef.current.rotation)
        modelRef.current.quaternion.copy(initialModelTransformRef.current.quaternion)
        logger.debug('Model root transform restored to initial state', {
          position: modelRef.current.position.toArray(),
          rotation: modelRef.current.rotation.toArray()
        })
      }
      
      // 恢复所有子对象的初始变换状态（包括头饰、衣服等）- 使用 uuid 确保匹配正确
      if (initialChildrenStateRef.current && modelRef.current) {
        let restoredChildCount = 0
        modelRef.current.traverse((child) => {
          const initialState = initialChildrenStateRef.current!.get(child.uuid)
          if (initialState) {
            child.position.copy(initialState.position)
            child.rotation.copy(initialState.rotation)
            child.quaternion.copy(initialState.quaternion)
            child.scale.copy(initialState.scale)
            
            // 标记需要更新矩阵
            child.matrixAutoUpdate = true
            child.updateMatrix()
            
            restoredChildCount++
          }
        })
        logger.debug(`Restored ${restoredChildCount} children to initial state`)
      }
      
      // 强制更新整个模型树的世界矩阵
      if (modelRef.current) {
        modelRef.current.updateMatrix()
        modelRef.current.updateMatrixWorld(true)
        
        // 如果有骨骼，强制更新骨骼矩阵
        if (modelRef.current.skeleton) {
          modelRef.current.skeleton.update()
          logger.debug('Skeleton matrices updated')
        }
        
        logger.debug('Model matrices updated')
      }
      
      // 重置 MMDAnimationHelper 的 mixer 时间到 0
      const mixer = (helperRef.current as any).objects?.get(modelRef.current)?.mixer
      if (mixer) {
        // 重置 mixer 时间
        mixer.time = 0
        
        // 重置所有 action 的时间
        const actions = mixer._actions || []
        for (const action of actions) {
          action.time = 0
          action.timeScale = 1
        }
        
        // 立即更新一次以应用时间重置
        mixer.update(0)
        
        logger.debug('Mixer time reset to 0')
      }
      
      // 禁用所有动画功能
      helperRef.current.enable('animation', false)
      helperRef.current.enable('ik', false)
      helperRef.current.enable('grant', false)
      helperRef.current.enable('physics', false)
      
      logger.debug('Animation pose, expressions, transform and all children reset to initial state')
    }

    setState(prev => ({ ...prev, isPlaying: false, progress: 0 }))
    onStopRef.current?.()
    
    logger.info('Animation stopped and reset to beginning')
  }, [enableIK, enableGrant])

  const seek = useCallback((time: number) => {
    if (!helperRef.current || !audioRef.current || animationDurationRef.current <= 0) {
      logger.warn('Cannot seek: missing helper, audio or invalid duration')
      return
    }

    const clampedTime = Math.max(0, Math.min(time, animationDurationRef.current))
    logger.info('Seeking to time:', clampedTime)

    // 记录之前的播放状态
    const wasPlaying = stateRef.current.isPlaying

    // 如果正在播放，先暂停
    if (wasPlaying) {
      helperRef.current.enable('animation', false)
      helperRef.current.enable('ik', false)
      helperRef.current.enable('grant', false)
      helperRef.current.enable('physics', false)
      audioRef.current.pause()
    }

    // 重置 clock 和动画
    if (clockRef.current) {
      clockRef.current.stop()
      clockRef.current.start()
    }

    // 手动推进动画到目标时间
    // 通过调用 update(targetTime) 来跳转动画
    helperRef.current.enable('animation', true)
    helperRef.current.enable('ik', enableIK)
    helperRef.current.enable('grant', enableGrant)
    helperRef.current.enable('physics', false) // 跳转时禁用物理
    
    helperRef.current.update(clampedTime)
    
    // 如果之前不是播放状态，禁用动画
    if (!wasPlaying) {
      helperRef.current.enable('animation', false)
      helperRef.current.enable('ik', false)
      helperRef.current.enable('grant', false)
      helperRef.current.enable('physics', false)
    } else {
      // 如果之前在播放，重新启用物理
      helperRef.current.enable('physics', enablePhysics)
    }

    // 调整音频时间
    audioRef.current.currentTime = clampedTime

    // 如果之前在播放，继续播放
    if (wasPlaying) {
      audioRef.current.play().catch(error => {
        logger.error('Audio play error after seek:', error)
      })
      
      // 重置 clock 以同步新的起始时间
      if (clockRef.current) {
        clockRef.current.stop()
        clockRef.current.start()
      }
    }

    // 更新进度状态
    setState(prev => ({ ...prev, progress: clampedTime / animationDurationRef.current }))
    logger.info('Seek completed')
  }, [enableIK, enableGrant, enablePhysics])

  const createControls = useCallback((): PlaybackControlsExtended => ({
    play,
    pause,
    stop,
    seek,
    get isPlaying() { return stateRef.current.isPlaying },
    get progress() { return stateRef.current.progress },
    get duration() { return animationDurationRef.current },
    setVolume: (v: number) => {
      if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, v))
    },
    setLoop: (l: boolean) => {
      if (audioRef.current) audioRef.current.loop = l
    },
  }), [play, pause, stop, seek])

  /**
   * Window resize
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
   * Lifecycle
   */
  useEffect(() => {
    initThreeJS()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
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
  }, [handleResize]) // Only handleResize, initThreeJS runs once

  // Load model
  useEffect(() => {
    if (sceneRef.current && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      const timer = setTimeout(() => loadModel(), 100)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [loadModel])

  // Reset when modelPath changes
  useEffect(() => {
    hasLoadedRef.current = false
  }, [modelPath])

  /**
   * Render
   */
  return (
    <div ref={containerRef} className={`sa2kit-animation-viewer ${className}`} style={{ width: '100%', height: '100%', position: 'relative', ...style }}>
      {/* Loading overlay */}
      {(state.modelLoading || state.animationLoading) && (
        <div style={{
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
              {state.modelLoading ? 'Loading model...' : 'Loading animation...'}
            </div>
            <div style={{ fontSize: '14px', color: 'rgb(107, 114, 128)' }}>
              {state.loadProgress.toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {state.error && (
        <div style={{
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
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
            padding: '24px',
            maxWidth: '448px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'rgb(220, 38, 38)', marginBottom: '8px' }}>
              Loading Failed
            </div>
            <div style={{ fontSize: '14px', color: 'rgb(75, 85, 99)' }}>{state.error.message}</div>
          </div>
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

MMDAnimationViewer.displayName = 'MMDAnimationViewer'

export default MMDAnimationViewer

