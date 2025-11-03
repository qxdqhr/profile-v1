import { useCallback, useRef, useEffect } from 'react'
import type { SoundEffectType } from '../types'

/**
 * 音效系统Hook
 * 管理和播放游戏音效
 */
export function useSoundEffects(enabled: boolean = true, volume: number = 0.7) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const soundsRef = useRef<Map<SoundEffectType, HTMLAudioElement>>(new Map())

  // 初始化音频上下文
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    return () => {
      // 清理音频资源
      soundsRef.current.forEach(audio => {
        audio.pause()
        audio.src = ''
      })
      soundsRef.current.clear()
      
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // 播放音效
  const playSound = useCallback((type: SoundEffectType) => {
    if (!enabled) return

    try {
      // 这里使用Web Audio API生成简单的音效
      if (!audioContextRef.current) return

      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // 根据不同类型设置不同的音效
      switch (type) {
        case 'tap':
          oscillator.frequency.value = 800
          gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
          oscillator.start(ctx.currentTime)
          oscillator.stop(ctx.currentTime + 0.1)
          break

        case 'success':
          oscillator.frequency.value = 1000
          gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
          oscillator.start(ctx.currentTime)
          oscillator.stop(ctx.currentTime + 0.3)
          break

        case 'error':
          oscillator.frequency.value = 200
          gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
          oscillator.start(ctx.currentTime)
          oscillator.stop(ctx.currentTime + 0.2)
          break

        case 'item_use':
          oscillator.frequency.value = 1200
          gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
          oscillator.start(ctx.currentTime)
          oscillator.stop(ctx.currentTime + 0.15)
          break

        case 'level_up':
          // 升级音效 - 上升的音调
          const frequencies = [800, 1000, 1200, 1500]
          frequencies.forEach((freq, index) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.frequency.value = freq
            gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime + index * 0.1)
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.1 + 0.2)
            osc.start(ctx.currentTime + index * 0.1)
            osc.stop(ctx.currentTime + index * 0.1 + 0.2)
          })
          break

        case 'happy':
          oscillator.frequency.value = 1500
          oscillator.type = 'sine'
          gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
          oscillator.start(ctx.currentTime)
          oscillator.stop(ctx.currentTime + 0.3)
          break

        case 'sad':
          oscillator.frequency.value = 300
          oscillator.type = 'sine'
          gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
          oscillator.start(ctx.currentTime)
          oscillator.stop(ctx.currentTime + 0.5)
          break

        default:
          oscillator.frequency.value = 440
          gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
          oscillator.start(ctx.currentTime)
          oscillator.stop(ctx.currentTime + 0.1)
      }
    } catch (error) {
      console.error('播放音效失败:', error)
    }
  }, [enabled, volume])

  // 播放背景音乐（占位）
  const playBackgroundMusic = useCallback(() => {
    if (!enabled) return
    console.log('播放背景音乐')
    // TODO: 实现背景音乐播放
  }, [enabled])

  // 停止背景音乐
  const stopBackgroundMusic = useCallback(() => {
    console.log('停止背景音乐')
    // TODO: 实现背景音乐停止
  }, [])

  return {
    playSound,
    playBackgroundMusic,
    stopBackgroundMusic,
  }
}

