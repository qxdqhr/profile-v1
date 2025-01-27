import { useState, useEffect, useRef } from 'react'

export const useMusic = () => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isMusicLoaded, setIsMusicLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/linkGame/mp3/ShakeIt!-Miku.mp3')
    audioRef.current.loop = true
    
    audioRef.current.addEventListener('canplaythrough', () => {
      setIsMusicLoaded(true)
    })
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('canplaythrough', () => {
          setIsMusicLoaded(true)
        })
        audioRef.current = null
      }
    }
  }, [])

  const startBackgroundMusic = () => {
    if (audioRef.current && !isMusicPlaying && isMusicLoaded) {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMusicPlaying(true)
          })
          .catch(error => {
            console.log("音乐播放失败:", error)
          })
      }
    }
  }

  const toggleMusic = () => {
    if (audioRef.current && isMusicLoaded) {
      if (isMusicPlaying) {
        audioRef.current.pause()
      } else {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("音乐播放失败:", error)
          })
        }
      }
      setIsMusicPlaying(!isMusicPlaying)
    }
  }

  return {
    isMusicPlaying,
    isMusicLoaded,
    startBackgroundMusic,
    toggleMusic
  }
} 