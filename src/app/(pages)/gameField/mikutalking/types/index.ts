/**
 * 米库说话游戏类型定义
 */

import * as THREE from 'three'

// ===== 交互区域 =====

/** 可交互的身体部位 */
export type BodyPart = 
  | 'head'      // 头部
  | 'face'      // 脸部
  | 'body'      // 身体
  | 'leftArm'   // 左手
  | 'rightArm'  // 右手
  | 'leftLeg'   // 左腿
  | 'rightLeg'  // 右腿
  | 'none'      // 无交互区域

/** 交互区域定义 */
export interface InteractionZone {
  id: BodyPart
  label: string
  /** 屏幕坐标边界（百分比） */
  bounds: {
    x: number      // 中心x坐标 (0-100%)
    y: number      // 中心y坐标 (0-100%)
    width: number  // 宽度 (0-100%)
    height: number // 高度 (0-100%)
  }
  /** 3D模型坐标范围（可选，用于精确检测） */
  worldBounds?: {
    min: THREE.Vector3
    max: THREE.Vector3
  }
}

// ===== 动画类型 =====

/** 动画类型枚举 */
export type AnimationType =
  | 'idle'          // 待机
  | 'happy'         // 开心
  | 'excited'       // 兴奋
  | 'shy'           // 害羞
  | 'angry'         // 生气
  | 'sad'           // 难过
  | 'surprised'     // 惊讶
  | 'dance'         // 跳舞
  | 'wave'          // 挥手
  | 'nod'           // 点头
  | 'shake_head'    // 摇头
  | 'laugh'         // 大笑
  | 'cry'           // 哭泣
  | 'sleep'         // 睡觉
  | 'eat'           // 吃东西
  | 'play'          // 玩耍
  | 'think'         // 思考
  | 'custom'        // 自定义

/** 动画配置 */
export interface AnimationConfig {
  type: AnimationType
  name: string
  vmdPath?: string      // VMD文件路径
  duration?: number     // 持续时间（秒）
  loop?: boolean        // 是否循环
  priority?: number     // 优先级（数字越大优先级越高）
  cooldown?: number     // 冷却时间（秒）
}

// ===== 道具系统 =====

/** 道具类型 */
export type ItemType =
  | 'food'      // 食物
  | 'toy'       // 玩具
  | 'gift'      // 礼物
  | 'decoration' // 装饰

/** 道具定义 */
export interface Item {
  id: string
  name: string
  type: ItemType
  icon: string              // 图标emoji或图片路径
  description?: string
  effectAnimation?: AnimationType // 使用后触发的动画
  emotionChange?: {         // 情绪变化
    happiness?: number
    energy?: number
    hunger?: number
  }
  consumable: boolean       // 是否消耗品
  initialQuantity?: number  // 初始数量
}

/** 道具库存 */
export interface ItemInventory {
  [itemId: string]: number  // 道具ID -> 数量
}

// ===== 手势类型 =====

/** 手势类型 */
export type GestureType =
  | 'tap'           // 单击
  | 'double_tap'    // 双击
  | 'long_press'    // 长按
  | 'drag'          // 拖拽
  | 'swipe_up'      // 向上滑动
  | 'swipe_down'    // 向下滑动
  | 'swipe_left'    // 向左滑动
  | 'swipe_right'   // 向右滑动
  | 'pinch'         // 捏合
  | 'spread'        // 张开

/** 手势事件 */
export interface GestureEvent {
  type: GestureType
  bodyPart: BodyPart
  position: { x: number; y: number }
  velocity?: { x: number; y: number }
  distance?: number
  duration?: number
  timestamp: number
}

// ===== 情绪系统 =====

/** 情绪类型 */
export type EmotionType =
  | 'neutral'   // 中立
  | 'happy'     // 开心
  | 'excited'   // 兴奋
  | 'sad'       // 难过
  | 'angry'     // 生气
  | 'tired'     // 疲惫
  | 'hungry'    // 饥饿
  | 'bored'     // 无聊

/** 情绪状态 */
export interface EmotionState {
  current: EmotionType
  happiness: number   // 0-100
  energy: number      // 0-100
  hunger: number      // 0-100
  affection: number   // 亲密度 0-100
  level: number       // 等级
  experience: number  // 经验值
}

// ===== 变声效果 =====

/** 变声效果类型 */
export type VoiceEffectType =
  | 'normal'      // 正常
  | 'high_pitch'  // 高音（尖声）
  | 'low_pitch'   // 低音（低沉）
  | 'robot'       // 机器人
  | 'echo'        // 回声
  | 'reverb'      // 混响
  | 'fast'        // 快速
  | 'slow'        // 慢速
  | 'alien'       // 外星人

/** 变声效果配置 */
export interface VoiceEffectConfig {
  type: VoiceEffectType
  label: string
  icon: string
  params: {
    pitch?: number        // 音调 (0.5-2.0)
    playbackRate?: number // 播放速度 (0.5-2.0)
    echo?: {
      delay: number       // 延迟（秒）
      decay: number       // 衰减 (0-1)
    }
    reverb?: {
      duration: number    // 持续时间（秒）
      decay: number       // 衰减 (0-1)
    }
  }
}

/** 录音状态 */
export type RecordingState = 
  | 'idle'        // 空闲
  | 'recording'   // 录音中
  | 'processing'  // 处理中
  | 'ready'       // 准备播放
  | 'playing'     // 播放中

/** 录音数据 */
export interface RecordingData {
  blob: Blob
  url: string
  duration: number
  timestamp: number
}

// ===== 游戏状态 =====

/** 游戏状态 */
export interface GameState {
  // 模型相关
  modelLoaded: boolean
  currentAnimation: AnimationType
  animationQueue: AnimationType[]
  
  // 情绪状态
  emotion: EmotionState
  
  // 道具系统
  inventory: ItemInventory
  
  // 交互状态
  lastInteraction: number     // 最后交互时间戳
  interactionCount: number    // 交互次数
  
  // 录音状态
  recordingState: RecordingState
  currentRecording?: RecordingData
  recordings: RecordingData[]
  currentVoiceEffect: VoiceEffectType
  
  // UI状态
  showTutorial: boolean
  showSettings: boolean
  debugMode: boolean
  
  // 设置
  volume: number              // 音量 0-1
  soundEnabled: boolean
  musicEnabled: boolean
}

// ===== 事件类型 =====

/** 游戏事件类型 */
export type GameEventType =
  | 'interaction'   // 交互事件
  | 'animation'     // 动画事件
  | 'emotion'       // 情绪变化
  | 'item_use'      // 道具使用
  | 'level_up'      // 升级
  | 'achievement'   // 成就

/** 游戏事件 */
export interface GameEvent {
  type: GameEventType
  timestamp: number
  data?: any
}

// ===== 配置类型 =====

/** 游戏配置 */
export interface GameConfig {
  // 情绪系统配置
  emotionDecayRate: number        // 情绪衰减速率
  hungerIncreaseRate: number      // 饥饿增长速率
  energyDecayRate: number         // 能量衰减速率
  
  // 动画配置
  idleAnimationInterval: number   // 待机动画间隔（秒）
  animationTransitionTime: number // 动画过渡时间（秒）
  
  // 交互配置
  tapRadius: number               // 点击检测半径
  longPressDuration: number       // 长按判定时长（毫秒）
  doubleTapDelay: number          // 双击判定延迟（毫秒）
  swipeThreshold: number          // 滑动阈值
  
  // 录音配置
  maxRecordingDuration: number    // 最大录音时长（秒）
  maxRecordings: number           // 最大录音数量
  
  // 等级系统
  experiencePerInteraction: number // 每次交互经验值
  levelUpThreshold: number         // 升级所需经验值
}

// ===== 默认配置 =====

export const DEFAULT_GAME_CONFIG: GameConfig = {
  emotionDecayRate: 0.1,
  hungerIncreaseRate: 0.05,
  energyDecayRate: 0.08,
  idleAnimationInterval: 10,
  animationTransitionTime: 0.5,
  tapRadius: 50,
  longPressDuration: 500,
  doubleTapDelay: 300,
  swipeThreshold: 50,
  maxRecordingDuration: 10,
  maxRecordings: 5,
  experiencePerInteraction: 10,
  levelUpThreshold: 100,
}

// ===== 音效类型 =====

/** 音效类型 */
export type SoundEffectType =
  | 'tap'           // 点击音效
  | 'success'       // 成功音效
  | 'error'         // 错误音效
  | 'item_use'      // 道具使用音效
  | 'level_up'      // 升级音效
  | 'happy'         // 开心音效
  | 'sad'           // 难过音效
  | 'background'    // 背景音乐

