/**
 * MMD 动画相关类型定义
 */

/**
 * MMD 动画信息
 */
export interface MMDAnimation {
  /** 动画ID */
  id: string
  /** 动画名称 */
  name: string
  /** VMD 动作文件路径 */
  motionPath: string
  /** VMD 相机动画文件路径（可选）*/
  cameraPath?: string
  /** 音频文件路径（可选）*/
  audioPath?: string
  /** 动画时长（秒）*/
  duration?: number
  /** 缩略图URL（可选）*/
  thumbnail?: string
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
  /** 跳转到指定时间 */
  seek: (time: number) => void
  /** 是否正在播放 */
  isPlaying: boolean
  /** 当前播放进度 (0-1) */
  progress: number
  /** 动画总时长（秒）*/
  duration: number
}

/**
 * 播放状态
 */
export interface PlaybackState {
  /** 是否正在播放 */
  isPlaying: boolean
  /** 是否暂停 */
  isPaused: boolean
  /** 当前时间（秒）*/
  currentTime: number
  /** 总时长（秒）*/
  duration: number
  /** 音量 (0-1) */
  volume: number
  /** 是否循环 */
  loop: boolean
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

