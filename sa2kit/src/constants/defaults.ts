/**
 * SA2Kit 默认配置常量
 */

import type { CameraControlConfig } from '../types/camera'

/**
 * MMDViewer 默认配置
 */
export const DEFAULT_VIEWER_CONFIG: {
  backgroundColor: number
  enableFog: boolean
  enableShadows: boolean
  showGround: boolean
  groundColor: number
  showGrid: boolean
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
  cameraFov: number
  enableCameraControls: boolean
  cameraMinDistance: number
  cameraMaxDistance: number
  ambientLightIntensity: number
  directionalLightIntensity: number
  pointLightIntensity: number
  targetModelSize: number
  autoAdjustToGround: boolean
  modelFileName: string
  autoPlay: boolean
  debugMode: boolean
  showStats: boolean
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug'
} = {
  // 场景配置
  backgroundColor: 0xe8f4f8, // 浅蓝色
  enableFog: true,
  enableShadows: true,
  showGround: true,
  groundColor: 0xd4e5f0,
  showGrid: false,
  
  // 相机配置
  cameraPosition: [0, 10, 25],
  cameraTarget: [0, 8, 0],
  cameraFov: 45,
  enableCameraControls: true,
  cameraMinDistance: 5,
  cameraMaxDistance: 100,
  
  // 光照配置
  ambientLightIntensity: 1.0,
  directionalLightIntensity: 0.8,
  pointLightIntensity: 0.5,
  
  // 模型配置
  targetModelSize: 20,
  autoAdjustToGround: true,
  modelFileName: 'model.pmx',
  
  // 动画配置
  autoPlay: false,
  
  // 调试配置
  debugMode: false,
  showStats: false,
  logLevel: 'warn',
}

/**
 * 相机控制默认配置
 */
export const DEFAULT_CAMERA_CONTROL_CONFIG: Required<CameraControlConfig> = {
  moveSensitivity: 0.03,
  zoomSensitivity: 0.5,
  elevateSensitivity: 0.5,
  enableDamping: true,
  dampingFactor: 0.05,
}

/**
 * 纹理子目录映射
 * MMD 模型常见的纹理文件组织方式
 */
export const TEXTURE_SUBDIRECTORIES = {
  texture: 'tex',     // 标准纹理
  sphere: 'spa',      // 球面贴图
  toon: 'toon',       // 卡通渲染贴图
  extra: 'tex_02',    // 额外纹理
} as const

/**
 * 支持的 MMD 模型文件扩展名
 */
export const SUPPORTED_MODEL_EXTENSIONS = ['.pmx', '.pmd'] as const

/**
 * 支持的 VMD 动画文件扩展名
 */
export const SUPPORTED_ANIMATION_EXTENSIONS = ['.vmd'] as const

/**
 * 支持的音频文件扩展名
 */
export const SUPPORTED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg'] as const

/**
 * 支持的纹理文件扩展名
 */
export const SUPPORTED_TEXTURE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.bmp',
  '.tga',
  '.psd',
] as const

/**
 * Ammo.js 物理引擎配置
 */
export const AMMO_CONFIG = {
  /** 重力加速度 */
  gravity: -9.8,
  /** WASM 文件相对路径（用户需要自行配置）*/
  wasmPath: '/libs/ammo.wasm.wasm',
  /** JS 文件相对路径（用户需要自行配置）*/
  jsPath: '/libs/ammo.wasm.js',
} as const

/**
 * SA2Kit 版本号
 */
export const VERSION = '1.0.0'

