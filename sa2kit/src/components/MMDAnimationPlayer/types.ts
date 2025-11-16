/**
 * MMDAnimationPlayer 组件特定类型
 */

import * as THREE from 'three'

export interface MMDAnimationPlayerProps {
  // ===== 必需配置 =====
  /** 模型引用（必须是已加载的 MMD 模型）*/
  modelRef: React.RefObject<THREE.Group>
  
  // ===== 动画配置 =====
  /** VMD 动作文件路径 */
  motionPath?: string
  /** VMD 相机动画文件路径 */
  cameraMotionPath?: string
  /** 音频文件路径 */
  audioPath?: string
  
  // ===== 播放控制 =====
  /** 是否自动播放（默认: false）*/
  autoPlay?: boolean
  /** 是否循环播放（默认: false）*/
  loop?: boolean
  /** 音量 (0-1，默认: 0.7) */
  volume?: number
  /** 播放速度（0.5-2.0，默认: 1.0）*/
  playbackRate?: number
  
  // ===== 物理引擎 =====
  /** 是否启用物理效果（默认: true）*/
  enablePhysics?: boolean
  /** 是否启用 IK（反向运动学，默认: true）*/
  enableIK?: boolean
  /** 是否启用 Grant（附属变形，默认: true）*/
  enableGrant?: boolean
  
  // ===== 回调函数 =====
  /** 播放器就绪回调 */
  onReady?: (controls: PlaybackControls) => void
  /** 开始播放回调 */
  onPlay?: () => void
  /** 暂停播放回调 */
  onPause?: () => void
  /** 停止播放回调 */
  onStop?: () => void
  /** 播放进度回调 (0-1) */
  onProgress?: (progress: number) => void
  /** 播放结束回调 */
  onEnd?: () => void
  /** 播放错误回调 */
  onError?: (error: Error) => void
  
  // ===== 调试配置 =====
  /** 是否启用调试模式 */
  debugMode?: boolean
  /** 日志级别 */
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug'
}

/**
 * 播放控制接口
 */
export interface PlaybackControls {
  /** 播放 */
  play: () => Promise<void>
  /** 暂停 */
  pause: () => void
  /** 停止 */
  stop: () => void
  /** 跳转到指定时间（秒）*/
  seek: (time: number) => void
  /** 是否正在播放 */
  isPlaying: boolean
  /** 当前播放进度 (0-1) */
  progress: number
  /** 动画总时长（秒）*/
  duration: number
  /** 设置音量 (0-1) */
  setVolume: (volume: number) => void
  /** 设置循环播放 */
  setLoop: (loop: boolean) => void
}

/**
 * 动画加载状态
 */
export interface AnimationLoadState {
  /** 是否正在加载 */
  loading: boolean
  /** 加载进度 (0-100) */
  progress: number
  /** 错误信息 */
  error: Error | null
  /** 是否加载完成 */
  loaded: boolean
}
