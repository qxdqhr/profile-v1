'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import styles from './styles.module.css'

export default function PlayMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleImageClick = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>点击图片播放音乐</h1>
      
      <div className={styles.imageContainer} onClick={handleImageClick}>
        <Image 
          src="/music-image.jpg" 
          alt="点击播放音乐" 
          width={300} 
          height={300}
          className={`${styles.image} ${isPlaying ? styles.rotating : ''}`}
        />
        {isPlaying && <div className={styles.playingIndicator}>正在播放</div>}
      </div>
      
      <audio 
        ref={audioRef}
        src="/sample-music.mp3" 
        onEnded={() => setIsPlaying(false)}
      />
      
      <p className={styles.instruction}>
        {isPlaying ? '点击图片停止播放' : '点击图片开始播放'}
      </p>
    </div>
  )
}
