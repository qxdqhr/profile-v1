import { useState, useEffect, useRef } from 'react'

// 音乐列表
const MUSIC_LIST = [
  {
    path: '/linkGame/mp3/ShakeIt!-Miku.mp3',
    name: 'Shake It!'
  },
  {
    path: '/linkGame/mp3/VivalaVida.mp3',
    name: 'VivalaVida'
  },
  // 在这里添加更多音乐...
]

export const useMusic = () => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isMusicLoaded, setIsMusicLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentMusicIndex, setCurrentMusicIndex] = useState<number>(-1)
  const lastPlayedIndex = useRef<number>(-1)

  const loadNewMusic = () => {
    // 获取一个不同于上次的随机索引
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
    }
  }

  useEffect(() => {
    // 初始化时加载第一首音乐
    audioRef.current = new Audio()
    audioRef.current.loop = true
    audioRef.current.setAttribute('playsinline', 'true')
    audioRef.current.setAttribute('webkit-playsinline', 'true')
    
    loadNewMusic()
    
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
    toggleMusic,
    loadNewMusic,
    currentMusic: currentMusicIndex >= 0 ? MUSIC_LIST[currentMusicIndex] : null
  }
} 