/**
 * MMDAnimationViewer Types
 * 
 * @module sa2kit/components/MMDAnimationViewer
 */

/**
 * Animation viewer state
 */
export interface AnimationViewerState {
  /** Model loading */
  modelLoading: boolean
  /** Model loaded */
  modelLoaded: boolean
  /** Animation loading */
  animationLoading: boolean
  /** Animation loaded */
  animationLoaded: boolean
  /** Is playing */
  isPlaying: boolean
  /** Current progress (0-1) */
  progress: number
  /** Load progress (0-100) */
  loadProgress: number
  /** Error */
  error: Error | null
}

/**
 * Playback controls (extended)
 */
export interface PlaybackControlsExtended {
  /** Play animation */
  play: () => Promise<void>
  /** Pause animation */
  pause: () => void
  /** Stop animation */
  stop: () => void
  /** Seek to specific time */
  seek: (time: number) => void
  /** Current playing state */
  isPlaying: boolean
  /** Current progress (0-1) */
  progress: number
  /** Animation duration */
  duration: number
  /** Set volume */
  setVolume: (volume: number) => void
  /** Set loop */
  setLoop: (loop: boolean) => void
}

/**
 * MMDAnimationViewer component props
 */
export interface MMDAnimationViewerProps {
  // ===== Model Config =====
  /** Model file path */
  modelPath: string
  /** Texture base path (optional) */
  texturePath?: string
  /** Model file name (if modelPath is directory) */
  modelFileName?: string

  // ===== Animation Config =====
  /** Motion (VMD) file path */
  motionPath?: string
  /** Camera motion (VMD) file path */
  cameraMotionPath?: string
  /** Audio file path */
  audioPath?: string

  // ===== Scene Config =====
  /** Background color */
  backgroundColor?: number | string
  /** Enable fog */
  enableFog?: boolean
  /** Fog color */
  fogColor?: number | string
  /** Enable shadows */
  enableShadows?: boolean
  /** Show ground */
  showGround?: boolean
  /** Ground color */
  groundColor?: number | string
  /** Show grid */
  showGrid?: boolean

  // ===== Camera Config =====
  /** Camera position */
  cameraPosition?: [number, number, number]
  /** Camera target */
  cameraTarget?: [number, number, number]
  /** Camera FOV */
  cameraFov?: number
  /** Enable camera controls */
  enableCameraControls?: boolean

  // ===== Lighting Config =====
  /** Ambient light intensity */
  ambientLightIntensity?: number
  /** Directional light intensity */
  directionalLightIntensity?: number

  // ===== Playback Config =====
  /** Auto play on load */
  autoPlay?: boolean
  /** Loop animation */
  loop?: boolean
  /** Audio volume (0-1) */
  volume?: number

  // ===== Physics Config =====
  /** Enable physics */
  enablePhysics?: boolean
  /** Enable IK */
  enableIK?: boolean
  /** Enable Grant */
  enableGrant?: boolean
  /** Ammo.js path */
  ammoJsPath?: string
  /** Ammo WASM path */
  ammoWasmPath?: string

  // ===== Debug Config =====
  /** Debug mode */
  debugMode?: boolean
  /** Log level */
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug'

  // ===== Callbacks =====
  /** Called when ready with controls */
  onReady?: (controls: PlaybackControlsExtended) => void
  /** Called when animation starts playing */
  onPlay?: () => void
  /** Called when animation pauses */
  onPause?: () => void
  /** Called when animation stops */
  onStop?: () => void
  /** Called on progress update */
  onProgress?: (progress: number) => void
  /** Called when animation ends */
  onEnd?: () => void
  /** Called on error */
  onError?: (error: Error) => void
  /** Called when model loads */
  onLoad?: () => void

  // ===== Style =====
  /** Additional CSS class */
  className?: string
  /** Inline styles */
  style?: React.CSSProperties
}

