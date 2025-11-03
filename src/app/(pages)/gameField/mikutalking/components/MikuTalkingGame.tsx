'use client'

import React, { useState, useCallback, useEffect } from 'react'
import type { GameState, EmotionState, ItemInventory, AnimationType, RecordingState, VoiceEffectType } from '../types'
import { getInitialInventory } from '../constants/items'
import { DEFAULT_GAME_CONFIG } from '../types'

// 动态导入组件
import dynamic from 'next/dynamic'

const StatusBar = dynamic(() => import('./StatusBar'), { ssr: false })
const ItemBar = dynamic(() => import('./ItemBar'), { ssr: false })
const InteractionOverlay = dynamic(() => import('./InteractionOverlay'), { ssr: false })
const TutorialModal = dynamic(() => import('./TutorialModal'), { ssr: false })
const MikuMMDViewer = dynamic(() => import('./MikuMMDViewer'), { ssr: false })
const CameraControl = dynamic(() => import('./CameraControl'), { ssr: false })
const RightPanel = dynamic(() => import('./RightPanel'), { ssr: false })

/**
 * 米库说话主游戏组件
 */
export default function MikuTalkingGame() {
  // 初始情绪状态
  const initialEmotion: EmotionState = {
    current: 'neutral',
    happiness: 80,
    energy: 90,
    hunger: 30,
    affection: 50,
    level: 1,
    experience: 0,
  }

  // 游戏状态
  const [gameState, setGameState] = useState<GameState>({
    modelLoaded: false,
    currentAnimation: 'idle',
    animationQueue: [],
    emotion: initialEmotion,
    inventory: getInitialInventory(),
    lastInteraction: Date.now(),
    interactionCount: 0,
    recordingState: 'idle',
    recordings: [],
    currentVoiceEffect: 'normal',
    showTutorial: true,
    showSettings: false,
    debugMode: false,
    volume: 0.7,
    soundEnabled: true,
    musicEnabled: true,
  })

  // 相机控制
  const [cameraControls, setCameraControls] = useState<{
    moveCamera: (deltaX: number, deltaY: number) => void
    zoomCamera: (delta: number) => void
    resetCamera: () => void
  } | null>(null)

  // 动作播放控制
  const [animationControls, setAnimationControls] = useState<{
    playAnimation: () => Promise<void>
    pauseAnimation: () => void
    resumeAnimation: () => void
    stopAnimation: () => void
    isPlaying: boolean
    progress: number
  } | null>(null)
  
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)

  // MMD动作配置
  const mmdConfig = {
    modelPath: '/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx',
    motionPath: '/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd',
    cameraPath: '/mikutalking/actions/CatchTheWave/camera.vmd',
    audioPath: '/mikutalking/actions/CatchTheWave/pv_268.wav',
  }

  // 不再需要预加载模型数据，MikuMMDViewer会直接从URL加载
  // useEffect已移除

  // 模型加载完成回调
  const handleModelLoad = useCallback((model: any) => {
    setGameState(prev => ({ ...prev, modelLoaded: true }))
  }, [])

  // 模型加载错误回调
  const handleModelError = useCallback((error: Error) => {
    console.error('MMD模型加载失败:', error)
  }, [])

  // 相机准备就绪回调
  const handleCameraReady = useCallback((controls: {
    moveCamera: (deltaX: number, deltaY: number) => void
    zoomCamera: (delta: number) => void
    resetCamera: () => void
  }) => {
    setCameraControls(controls)
  }, [])

  // 动作播放准备就绪回调
  const handleAnimationReady = useCallback((controls: {
    playAnimation: () => Promise<void>
    pauseAnimation: () => void
    resumeAnimation: () => void
    stopAnimation: () => void
    isPlaying: boolean
    progress: number
  }) => {
    setAnimationControls(controls)
  }, [])

  // 更新情绪状态
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
        {/* MMD模型查看器 - 互动模式 */}
        <div className="absolute inset-0">
          <MikuMMDViewer
            modelBasePath="/mikutalking/models/YYB_Z6SakuraMiku"
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

