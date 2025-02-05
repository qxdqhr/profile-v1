import { useState, useEffect, useRef } from 'react'

// 音乐列表
const MUSIC_LIST = [
  {
    path: '/linkGame/mp3/ShakeIt!-Miku.mp3',
    name: 'Shake It!'
  }
]

export const useMusic = () => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isMusicLoaded, setIsMusicLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentMusicIndex, setCurrentMusicIndex] = useState<number>(-1)
  const lastPlayedIndex = useRef<number>(-1)
  const hasInteracted = useRef<boolean>(false)  // 添加用户交互标记

  useEffect(() => {
    // 监听用户交互
    const handleInteraction = () => {
      hasInteracted.current = true
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('touchstart', handleInteraction)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }
  }, [])

  const loadNewMusic = async () => {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * MUSIC_LIST.length)
    } while (newIndex === lastPlayedIndex.current && MUSIC_LIST.length > 1)
    
    lastPlayedIndex.current = newIndex
    setCurrentMusicIndex(newIndex)
    
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = MUSIC_LIST[newIndex].path
      audioRef.current.load()
      
      if (hasInteracted.current && isMusicPlaying) {
        try {
          await audioRef.current.play()
        } catch (error) {
          console.log("音乐播放失败:", error)
        }
      }
    }
  }

  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.loop = true
    audioRef.current.setAttribute('playsinline', 'true')
    audioRef.current.setAttribute('webkit-playsinline', 'true')
    
    const handleCanPlayThrough = () => {
      setIsMusicLoaded(true)
    }
    
    audioRef.current.addEventListener('canplaythrough', handleCanPlayThrough)
    
    let newIndex = Math.floor(Math.random() * MUSIC_LIST.length)
    lastPlayedIndex.current = newIndex
    setCurrentMusicIndex(newIndex)
    
    if (audioRef.current) {
      audioRef.current.src = MUSIC_LIST[newIndex].path
      audioRef.current.load()
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('canplaythrough', handleCanPlayThrough)
        audioRef.current = null
        setIsMusicPlaying(false)  // 重置播放状态
      }
    }
  }, [])

  const startBackgroundMusic = async () => {
    if (!audioRef.current || !isMusicLoaded) return

    try {
      if (!hasInteracted.current) {
        // 如果用户还没有交互，等待第一次交互
        const waitForInteraction = new Promise<void>((resolve) => {
          const handler = () => {
            hasInteracted.current = true
            window.removeEventListener('click', handler)
            window.removeEventListener('touchstart', handler)
            resolve()
          }
          window.addEventListener('click', handler)
          window.addEventListener('touchstart', handler)
        })
        await waitForInteraction
      }

      // 使用渐入效果播放
      audioRef.current.volume = 0.001
      await audioRef.current.play()
      
      // 渐入音量
      const fadeIn = () => {
        if (!audioRef.current) return
        if (audioRef.current.volume < 0.95) {
          audioRef.current.volume = Math.min(1, audioRef.current.volume * 1.1)
          requestAnimationFrame(fadeIn)
        } else {
          audioRef.current.volume = 1
        }
      }
      requestAnimationFrame(fadeIn)
      
      setIsMusicPlaying(true)
    } catch (error) {
      console.log("音乐播放失败:", error)
    }
  }

  const toggleMusic = async () => {
    if (!audioRef.current || !isMusicLoaded) return

    try {
      if (isMusicPlaying) {
        audioRef.current.pause()
        setIsMusicPlaying(false)
      } else {
        if (!hasInteracted.current) {
          await new Promise<void>((resolve) => {
            const handler = () => {
              hasInteracted.current = true
              window.removeEventListener('click', handler)
              window.removeEventListener('touchstart', handler)
              resolve()
            }
            window.addEventListener('click', handler)
            window.addEventListener('touchstart', handler)
          })
        }
        await audioRef.current.play()
        setIsMusicPlaying(true)
      }
    } catch (error) {
      console.log("音乐播放失败:", error)
    }
  }

  return {
    isMusicPlaying,
    isMusicLoaded,
    startBackgroundMusic,
    toggleMusic,
    loadNewMusic,
    currentMusic: currentMusicIndex >= 0 ? MUSIC_LIST[currentMusicIndex] : null
  }
} 