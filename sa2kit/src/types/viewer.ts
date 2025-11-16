/**
 * MMD Viewer 组件相关类型定义
 */

import * as THREE from 'three'

/**
 * 相机控制接口
 */
export interface CameraControls {
  /** 移动相机视角（旋转）*/
  moveCamera: (deltaX: number, deltaY: number) => void
  /** 缩放相机（改变距离）*/
  zoomCamera: (delta: number) => void
  /** 升降相机（Z轴移动）*/
  elevateCamera: (delta: number) => void
  /** 重置相机到初始位置 */
  resetCamera: () => void
}

/**
 * 动画控制接口
 */
export interface AnimationControls {
  /** 播放动画 */
  playAnimation: () => Promise<void>
  /** 停止动画 */
  stopAnimation: () => void
  /** 是否正在播放 */
  isPlaying: boolean
  /** 播放进度 (0-100) */
  progress: number
}

/**
 * MMD Viewer 组件属性
 */
export interface MMDViewerProps {
  // ===== 模型配置 =====
  /** PMX/PMD 模型文件路径（必需）*/
  modelPath: string
  /** 纹理文件基础路径（可选，默认为模型所在目录）*/
  texturePath?: string
  /** 模型文件名（默认: 'model.pmx'）*/
  modelFileName?: string
  
  // ===== 场景配置 =====
  /** 背景颜色（默认: 0xe8f4f8 浅蓝色）*/
  backgroundColor?: number | string
  /** 是否启用雾效果（默认: true）*/
  enableFog?: boolean
  /** 雾的颜色（默认与背景色相同）*/
  fogColor?: number | string
  /** 是否启用阴影（默认: true）*/
  enableShadows?: boolean
  /** 是否显示地面（默认: true）*/
  showGround?: boolean
  /** 地面颜色（默认: 0xd4e5f0）*/
  groundColor?: number
  /** 是否显示网格辅助线（默认: false）*/
  showGrid?: boolean
  
  // ===== 相机配置 =====
  /** 相机初始位置（默认: [0, 10, 25]）*/
  cameraPosition?: [number, number, number]
  /** 相机初始目标点（默认: [0, 8, 0]）*/
  cameraTarget?: [number, number, number]
  /** 相机视角（FOV，默认: 45）*/
  cameraFov?: number
  /** 是否启用轨道控制器（默认: true）*/
  enableCameraControls?: boolean
  /** 相机最小距离（默认: 5）*/
  cameraMinDistance?: number
  /** 相机最大距离（默认: 100）*/
  cameraMaxDistance?: number
  
  // ===== 光照配置 =====
  /** 环境光强度（默认: 1.0）*/
  ambientLightIntensity?: number
  /** 方向光强度（默认: 0.8）*/
  directionalLightIntensity?: number
  /** 点光源强度（默认: 0.5）*/
  pointLightIntensity?: number
  
  // ===== 模型配置 =====
  /** 目标模型尺寸（用于自动缩放，默认: 20）*/
  targetModelSize?: number
  /** 是否自动调整模型到地面（默认: true）*/
  autoAdjustToGround?: boolean
  
  // ===== 动画配置（可选）=====
  /** VMD 动作文件路径 */
  motionPath?: string
  /** VMD 相机动画文件路径 */
  cameraAnimationPath?: string
  /** 音频文件路径 */
  audioPath?: string
  /** 是否自动播放动画（默认: false）*/
  autoPlay?: boolean
  
  // ===== 物理引擎配置 =====
  /** Ammo.js JS 文件路径 */
  ammoJsPath?: string
  /** Ammo.js WASM 文件路径 */
  ammoWasmPath?: string
  /** 是否启用物理引擎（默认: true）*/
  enablePhysics?: boolean
  /** 是否启用 IK（反向运动学）（默认: true）*/
  enableIK?: boolean
  /** 是否启用 Grant（默认: true）*/
  enableGrant?: boolean
  /** 是否启用地面（默认: true）*/
  enableGround?: boolean
  
  // ===== 调试配置 =====
  /** 是否启用调试模式（默认: false）*/
  debugMode?: boolean
  /** 是否显示性能统计（默认: false）*/
  showStats?: boolean
  /** 日志级别（默认: 'warn'）*/
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug'
  
  // ===== 回调函数 =====
  /** 模型加载成功回调 */
  onLoad?: (model: THREE.Group) => void
  /** 模型加载进度回调 (0-100) */
  onProgress?: (progress: number) => void
  /** 模型加载错误回调 */
  onError?: (error: Error) => void
  /** 相机控制就绪回调 */
  onCameraReady?: (controls: CameraControls) => void
  /** 动画控制就绪回调 */
  onAnimationReady?: (controls: AnimationControls) => void
  
  // ===== 样式配置 =====
  /** 容器类名 */
  className?: string
  /** 容器样式 */
  style?: React.CSSProperties
}

/**
 * 骨骼初始状态（用于重置动画）
 */
export interface BoneState {
  position: THREE.Vector3
  quaternion: THREE.Quaternion
  scale: THREE.Vector3
}

