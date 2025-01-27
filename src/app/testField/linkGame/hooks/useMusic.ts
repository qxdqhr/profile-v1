import { useState, useEffect, useRef } from 'react'

export const useMusic = () => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isMusicLoaded, setIsMusicLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/linkGame/mp3/ShakeIt!-Miku.mp3')
    audioRef.current.loop = true
    audioRef.current.setAttribute('playsinline', 'true')
    audioRef.current.setAttribute('webkit-playsinline', 'true')
    
    audioRef.current.load()
    
    const handleCanPlayThrough = () => {
      setIsMusicLoaded(true)
    }
    
    audioRef.current.addEventListener('canplaythrough', handleCanPlayThrough)
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('canplaythrough', handleCanPlayThrough)
        audioRef.current = null
      }
    }
  }, [])

  const startBackgroundMusic = async () => {
    if (audioRef.current && !isMusicPlaying && isMusicLoaded) {
      try {
        audioRef.current.volume = 0.001
        await audioRef.current.play()
        audioRef.current.volume = 1
        setIsMusicPlaying(true)
      } catch (error) {
        console.log("音乐播放失败:", error)
        alert("请点击屏幕任意位置开始播放音乐")
      }
    }
  }

  const toggleMusic = async () => {
    if (audioRef.current && isMusicLoaded) {
      try {
        if (isMusicPlaying) {
          audioRef.current.pause()
        } else {
          await audioRef.current.play()
        }
        setIsMusicPlaying(!isMusicPlaying)
      } catch (error) {
        console.log("音乐播放失败:", error)
      }
    }
  }

  return {
    isMusicPlaying,
    isMusicLoaded,
    startBackgroundMusic,
    toggleMusic
  }
} 