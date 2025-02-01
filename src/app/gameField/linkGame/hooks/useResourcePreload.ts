import { useState, useEffect } from 'react'
import { TYPES_COUNT } from '../types'

interface PreloadStatus {
  isLoading: boolean
  progress: number
  error: string | null
}

// 预定义音乐列表
const MUSIC_LIST = [
  { name: '歌に形はないけれど', path: '/linkGame/mp3/歌に形はないけれど.mp3' },
  { name: 'ShakeIt!-Miku', path: '/linkGame/mp3/ShakeIt!-Miku.mp3' },
  // ... 其他音乐
]

// 预定义音效列表
const SOUND_EFFECTS = {
  click: '/linkGame/sound/click.mp3',
  match: '/linkGame/sound/match.mp3'
}

export const useResourcePreload = () => {
  const [status, setStatus] = useState<PreloadStatus>({
    isLoading: true,
    progress: 0,
    error: null
  })

  useEffect(() => {
    const preloadResources = async () => {
      try {
        // 计算需要加载的总资源数（图片 + 背景图 + 音效）
        const totalResources = TYPES_COUNT + 1 + Object.keys(SOUND_EFFECTS).length
        let loadedResources = 0

        const updateProgress = () => {
          loadedResources++
          setStatus(prev => ({
            ...prev,
            progress: (loadedResources / totalResources) * 100
          }))
        }

        // 预加载背景图
        try {
          const bgImg = new Image()
          await new Promise((resolve, reject) => {
            bgImg.onload = resolve
            bgImg.onerror = () => reject('背景图加载失败')
            bgImg.src = '/linkGame/background.png'
          })
          updateProgress()
        } catch (error) {
          throw new Error('背景图加载失败: ' + error)
        }

        // 预加载方块图片
        try {
          const imageLoadPromises = Array.from({ length: TYPES_COUNT }, (_, i) => {
            return new Promise((resolve, reject) => {
              const img = new Image()
              img.onload = () => {
                updateProgress()
                resolve(null)
              }
              img.onerror = () => reject(`图标 ${i} 加载失败`)
              img.src = `/linkGame/icon/icon_${i}.png`
            })
          })

          await Promise.all(imageLoadPromises)
        } catch (error) {
          throw new Error('方块图片加载失败: ' + error)
        }

        // 预加载音效（必须加载完成）
        try {
          const soundEffectPromises = Object.values(SOUND_EFFECTS).map(path => {
            return new Promise((resolve, reject) => {
              const audio = new Audio()
              audio.preload = 'auto'
              
              audio.addEventListener('canplaythrough', () => {
                updateProgress()
                resolve(null)
              }, { once: true })
              
              audio.addEventListener('error', () => reject(`音效 ${path} 加载失败`))
              
              audio.src = path
              audio.load()
            })
          })

          await Promise.all(soundEffectPromises)
        } catch (error) {
          throw new Error('音效加载失败: ' + error)
        }

        // 音乐预加载（可选，不影响游戏开始）
        try {
          MUSIC_LIST.forEach(music => {
            const audio = new Audio()
            audio.preload = 'auto'
            audio.src = music.path
            audio.load()
          })
        } catch (error) {
          console.warn('音乐预加载失败，但不影响游戏进行:', error)
        }

        setStatus({
          isLoading: false,
          progress: 100,
          error: null
        })
      } catch (error) {
        console.error('资源加载错误:', error)
        setStatus({
          isLoading: false,
          progress: 0,
          error: error instanceof Error ? error.message : '资源加载失败，请刷新页面重试'
        })
      }
    }

    preloadResources()
  }, [])

  return status
} 