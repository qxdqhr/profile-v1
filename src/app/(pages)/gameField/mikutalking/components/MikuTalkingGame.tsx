'use client'

import React, { useState, useCallback, useEffect } from 'react'
import type { GameState, EmotionState, ItemInventory, AnimationType, RecordingState, VoiceEffectType } from '../types'
import { getInitialInventory } from '../constants/items'
import { DEFAULT_GAME_CONFIG } from '../types'

// 动态导入组件（避免SSR问题）
import dynamic from 'next/dynamic'

const StatusBar = dynamic(() => import('./StatusBar'), { ssr: false })
const ItemBar = dynamic(() => import('./ItemBar'), { ssr: false })
const InteractionOverlay = dynamic(() => import('./InteractionOverlay'), { ssr: false })
const TutorialModal = dynamic(() => import('./TutorialModal'), { ssr: false })
const MikuMMDViewer = dynamic(() => import('./MikuMMDViewer'), { ssr: false })
const CameraControl = dynamic(() => import('./CameraControl'), { ssr: false })
const RightPanel = dynamic(() => import('./RightPanel'), { ssr: false })

/**
 * ========================================
 * 米库说话主游戏组件
 * ========================================
 * 
 * 功能说明：
 * - 游戏主逻辑控制器
 * - 管理游戏状态（情绪、库存、交互等）
 * - 协调各个子组件
 * - 处理用户交互（点击、道具使用等）
 * - 自动情绪衰减和升级系统
 * - 集成MMD模型展示和动画控制
 * 
 * 组件结构：
 * - StatusBar: 顶部状态栏（情绪、等级、经验）
 * - MikuMMDViewer: 3D模型展示区域
 * - InteractionOverlay: 交互覆盖层（检测点击位置）
 * - ItemBar: 底部道具栏
 * - TutorialModal: 教程弹窗
 * - CameraControl: 相机控制器（桌面端）
 * - RightPanel: 右侧功能面板
 * 
 * @component
 */
export default function MikuTalkingGame() {
  
  // ========================================
  // 初始状态配置
  // ========================================
  
  /** 初始情绪状态 */
  const initialEmotion: EmotionState = {
    current: 'neutral',  // 当前情绪
    happiness: 80,       // 快乐度 (0-100)
    energy: 90,          // 能量 (0-100)
    hunger: 30,          // 饥饿度 (0-100)
    affection: 50,       // 亲密度 (0-100)
    level: 1,            // 等级
    experience: 0,       // 经验值
  }

  // ========================================
  // 状态管理
  // ========================================
  
  /** 游戏主状态 */
  const [gameState, setGameState] = useState<GameState>({
    modelLoaded: false,                          // 模型是否加载完成
    currentAnimation: 'idle',                    // 当前播放的动画
    animationQueue: [],                          // 动画队列
    emotion: initialEmotion,                     // 情绪状态
    inventory: getInitialInventory(),            // 道具库存
    lastInteraction: Date.now(),                 // 最后交互时间
    interactionCount: 0,                         // 交互次数统计
    recordingState: 'idle',                      // 录音状态
    recordings: [],                              // 录音列表
    currentVoiceEffect: 'normal',                // 当前变声效果
    showTutorial: true,                          // 是否显示教程
    showSettings: false,                         // 是否显示设置
    debugMode: false,                            // 是否开启调试模式
    volume: 0.7,                                 // 音量 (0-1)
    soundEnabled: true,                          // 音效是否开启
    musicEnabled: true,                          // 背景音乐是否开启
  })

  /** 相机控制器接口 */
  const [cameraControls, setCameraControls] = useState<{
    moveCamera: (deltaX: number, deltaY: number) => void
    zoomCamera: (delta: number) => void
    elevateCamera: (delta: number) => void
    resetCamera: () => void
  } | null>(null)

  /** 动画播放控制器接口 */
  const [animationControls, setAnimationControls] = useState<{
    playAnimation: () => Promise<void>
    stopAnimation: () => void
    isPlaying: boolean
    progress: number
  } | null>(null)
  
  /** 动画是否正在播放 */
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false)
  /** 动画播放进度 (0-100) */
  const [animationProgress, setAnimationProgress] = useState(0)

  // ========================================
  // MMD配置
  // ========================================
  
  /** MMD动作和模型配置 */
  const mmdConfig = {
    modelBasePath: '/mikutalking/models/YYB_Z6SakuraMiku',
    modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',                // PMX模型文件
    motionPath: '/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd',  // VMD动作文件
    cameraPath: '/mikutalking/actions/CatchTheWave/camera.vmd',                    // 相机动画文件
    audioPath: '/mikutalking/actions/CatchTheWave/pv_268.wav',                     // 音频文件
  }

  // ========================================
  // 回调函数
  // ========================================

  /**
   * 模型加载完成回调
   * @param model - Three.js 模型对象
   */
  const handleModelLoad = useCallback((model: any) => {
    setGameState(prev => ({ ...prev, modelLoaded: true }))
    console.log('✅ MMD模型加载成功')
  }, [])

  /**
   * 模型加载错误回调
   * @param error - 错误对象
   */
  const handleModelError = useCallback((error: Error) => {
    console.error('❌ MMD模型加载失败:', error)
  }, [])

  /**
   * 相机控制器准备就绪回调
   * 接收相机控制方法并保存到state
   */
  const handleCameraReady = useCallback((controls: {
    moveCamera: (deltaX: number, deltaY: number) => void
    zoomCamera: (delta: number) => void
    elevateCamera: (delta: number) => void
    resetCamera: () => void
  }) => {
    setCameraControls(controls)
    console.log('✅ 相机控制器就绪')
  }, [])

  /**
   * 动画控制器准备就绪回调
   * 接收动画控制方法并保存到state
   */
  const handleAnimationReady = useCallback((controls: {
    playAnimation: () => Promise<void>
    stopAnimation: () => void
    isPlaying: boolean
    progress: number
  }) => {
    setAnimationControls(controls)
    console.log('✅ 动画控制器就绪')
  }, [])

  // ========================================
  // 游戏逻辑函数
  // ========================================

  /**
   * 更新情绪状态
   * 
   * 功能：
   * - 更新指定的情绪属性
   * - 自动限制数值在 0-100 范围内
   * 
   * @param changes - 要更新的情绪属性（部分更新）
   */
  const updateEmotion = useCallback((changes: Partial<EmotionState>) => {
    setGameState(prev => ({
      ...prev,
      emotion: {
        ...prev.emotion,
        ...changes,
        // 限制数值范围
        happiness: Math.max(0, Math.min(100, (changes.happiness !== undefined ? changes.happiness : prev.emotion.happiness))),
        energy: Math.max(0, Math.min(100, (changes.energy !== undefined ? changes.energy : prev.emotion.energy))),
        hunger: Math.max(0, Math.min(100, (changes.hunger !== undefined ? changes.hunger : prev.emotion.hunger))),
        affection: Math.max(0, Math.min(100, (changes.affection !== undefined ? changes.affection : prev.emotion.affection))),
      }
    }))
  }, [])

  // 播放动画
  const playAnimation = useCallback((animation: AnimationType) => {
    setGameState(prev => ({
      ...prev,
      currentAnimation: animation,
    }))
  }, [])

  // 使用道具
  const useItem = useCallback((itemId: string) => {
    const item = require('../constants/items').getItemById(itemId)
    if (!item) return

    // 检查库存
    if (gameState.inventory[itemId] === undefined || gameState.inventory[itemId] <= 0) {
      console.log('道具不足:', itemId)
      return
    }

    // 扣除库存（如果是消耗品）
    if (item.consumable) {
      setGameState(prev => ({
        ...prev,
        inventory: {
          ...prev.inventory,
          [itemId]: prev.inventory[itemId] - 1,
        }
      }))
    }

    // 触发动画
    if (item.effectAnimation) {
      playAnimation(item.effectAnimation)
    }

    // 改变情绪
    if (item.emotionChange) {
      updateEmotion({
        happiness: gameState.emotion.happiness + (item.emotionChange.happiness || 0),
        energy: gameState.emotion.energy + (item.emotionChange.energy || 0),
        hunger: gameState.emotion.hunger + (item.emotionChange.hunger || 0),
      })
    }

    // 增加互动次数和经验值
    setGameState(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
      emotion: {
        ...prev.emotion,
        experience: prev.emotion.experience + DEFAULT_GAME_CONFIG.experiencePerInteraction,
      }
    }))
  }, [gameState.inventory, gameState.emotion, playAnimation, updateEmotion])

  // 处理身体部位点击
  const handleBodyPartClick = useCallback((bodyPart: string) => {
    console.log('点击了:', bodyPart)
    
    // 从动画配置中随机选择一个动画
    const { BODY_PART_ANIMATIONS } = require('../constants/animations')
    const animations = BODY_PART_ANIMATIONS[bodyPart as keyof typeof BODY_PART_ANIMATIONS] || ['happy']
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)]
    
    playAnimation(randomAnimation as AnimationType)
    
    // 增加亲密度和经验
    updateEmotion({
      affection: gameState.emotion.affection + 1,
      experience: gameState.emotion.experience + DEFAULT_GAME_CONFIG.experiencePerInteraction,
    })
    
    setGameState(prev => ({
      ...prev,
      lastInteraction: Date.now(),
      interactionCount: prev.interactionCount + 1,
    }))
  }, [gameState.emotion, playAnimation, updateEmotion])

  // 情绪自动衰减
  useEffect(() => {
    const interval = setInterval(() => {
      updateEmotion({
        hunger: gameState.emotion.hunger + DEFAULT_GAME_CONFIG.hungerIncreaseRate,
        energy: gameState.emotion.energy - DEFAULT_GAME_CONFIG.energyDecayRate,
      })

      // 根据饥饿度和能量自动改变情绪
      if (gameState.emotion.hunger > 80) {
        setGameState(prev => ({ ...prev, emotion: { ...prev.emotion, current: 'hungry' } }))
      } else if (gameState.emotion.energy < 20) {
        setGameState(prev => ({ ...prev, emotion: { ...prev.emotion, current: 'tired' } }))
      } else if (gameState.emotion.happiness > 70) {
        setGameState(prev => ({ ...prev, emotion: { ...prev.emotion, current: 'happy' } }))
      } else if (gameState.emotion.happiness < 30) {
        setGameState(prev => ({ ...prev, emotion: { ...prev.emotion, current: 'sad' } }))
      } else {
        setGameState(prev => ({ ...prev, emotion: { ...prev.emotion, current: 'neutral' } }))
      }
    }, 5000) // 每5秒更新一次

    return () => clearInterval(interval)
  }, [gameState.emotion, updateEmotion])

  // 检查是否升级
  useEffect(() => {
    if (gameState.emotion.experience >= DEFAULT_GAME_CONFIG.levelUpThreshold * gameState.emotion.level) {
      updateEmotion({
        level: gameState.emotion.level + 1,
        experience: 0,
      })
      playAnimation('excited')
      console.log('升级！新等级:', gameState.emotion.level + 1)
    }
  }, [gameState.emotion.experience, gameState.emotion.level, updateEmotion, playAnimation])

  return (
    <div className="w-full h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 overflow-hidden relative">
      {/* 状态栏 */}
      <StatusBar emotion={gameState.emotion} />

      {/* 主游戏区域 */}
      <div className="absolute inset-0">
        {/* MMD模型查看器 */}
        <div className="absolute inset-0">
          <MikuMMDViewer
            modelBasePath={mmdConfig.modelBasePath}
            motionPath={mmdConfig.motionPath}
            cameraPath={mmdConfig.cameraPath}
            audioPath={mmdConfig.audioPath}
            onLoad={handleModelLoad}
            onError={handleModelError}
            onCameraReady={handleCameraReady}
            onAnimationReady={handleAnimationReady}
          />
        </div>

        {/* 交互覆盖层 */}
        {gameState.modelLoaded && (
          <InteractionOverlay
            onBodyPartClick={handleBodyPartClick}
            debugMode={gameState.debugMode}
          />
        )}
      </div>

      {/* 道具栏 */}
      <ItemBar
        inventory={gameState.inventory}
        onUseItem={useItem}
      />

      {/* 教程弹窗 */}
      {gameState.showTutorial && (
        <TutorialModal
          onClose={() => setGameState(prev => ({ ...prev, showTutorial: false }))}
        />
      )}

      {/* 相机控制手柄（桌面端显示） */}
      {cameraControls && (
        <div className="hidden lg:block">
          <CameraControl
            onCameraMove={cameraControls.moveCamera}
            onCameraZoom={cameraControls.zoomCamera}
            onCameraElevate={cameraControls.elevateCamera}
            onCameraReset={cameraControls.resetCamera}
          />
        </div>
      )}

      {/* 右侧功能面板 */}
      <RightPanel
        cameraControls={cameraControls}
        animationControls={animationControls}
        recordingState={gameState.recordingState}
        currentVoiceEffect={gameState.currentVoiceEffect}
        onRecordingStateChange={(state) => setGameState(prev => ({ ...prev, recordingState: state }))}
        onVoiceEffectChange={(effect) => setGameState(prev => ({ ...prev, currentVoiceEffect: effect }))}
        soundEnabled={gameState.soundEnabled}
        volume={gameState.volume}
        musicEnabled={gameState.musicEnabled}
        debugMode={gameState.debugMode}
        onVolumeChange={(volume) => setGameState(prev => ({ ...prev, volume }))}
        onSoundToggle={() => setGameState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
        onMusicToggle={() => setGameState(prev => ({ ...prev, musicEnabled: !prev.musicEnabled }))}
        onDebugToggle={() => setGameState(prev => ({ ...prev, debugMode: !prev.debugMode }))}
        onShowTutorial={() => setGameState(prev => ({ ...prev, showTutorial: true }))}
      />
    </div>
  )
}

