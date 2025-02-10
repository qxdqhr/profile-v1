'use client'
import { useEffect, useRef, useState } from 'react'
import styles from './styles.module.css'

type ShareMode = 'video' | 'screenshot'

const ShareMonitor = () => {
  const [deviceAddress, setDeviceAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [shareMode, setShareMode] = useState<ShareMode>('video')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // 在组件卸载时关闭WebSocket连接
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const handleVideoStream = (event: MessageEvent) => {
    if (videoRef.current && event.data instanceof Blob) {
      const url = URL.createObjectURL(event.data)
      videoRef.current.src = url
    }
  }

  const handleScreenshot = (event: MessageEvent) => {
    if (canvasRef.current && event.data) {
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      // 处理Base64图片数据
      if (typeof event.data === 'string' && event.data.startsWith('data:image')) {
        const img = new Image()
        img.onload = () => {
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
          ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height)
        }
        img.src = event.data
      }
    }
  }

  const connectToDevice = () => {
    if (!deviceAddress) {
      setError('请输入设备IP地址')
      return
    }

    try {
      setError('')
      const ws = new WebSocket(`ws://${deviceAddress}:8080`)
      
      ws.onopen = () => {
        setIsConnected(true)
        console.log('Connected to device')
        // 发送模式信息给移动端
        ws.send(JSON.stringify({ type: 'mode', mode: shareMode }))
      }

      ws.onmessage = (event) => {
        if (shareMode === 'video') {
          handleVideoStream(event)
        } else {
          handleScreenshot(event)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
        setError('连接失败，请检查设备地址是否正确')
      }

      ws.onclose = () => {
        setIsConnected(false)
        console.log('Disconnected from device')
      }

      wsRef.current = ws
    } catch (error) {
      console.error('Connection error:', error)
      setError('连接出错，请稍后重试')
    }
  }

  const disconnectDevice = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
      setIsConnected(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1>设备投屏</h1>
      
      <div className={styles.modeSelector}>
        <label>
          <input
            type="radio"
            value="video"
            checked={shareMode === 'video'}
            onChange={(e) => setShareMode(e.target.value as ShareMode)}
            disabled={isConnected}
          />
          视频流模式
        </label>
        <label>
          <input
            type="radio"
            value="screenshot"
            checked={shareMode === 'screenshot'}
            onChange={(e) => setShareMode(e.target.value as ShareMode)}
            disabled={isConnected}
          />
          逐帧模式
        </label>
      </div>

      <div className={styles.connectionPanel}>
        <input
          type="text"
          value={deviceAddress}
          onChange={(e) => setDeviceAddress(e.target.value)}
          placeholder="输入设备IP地址"
          className={styles.input}
        />
        <button 
          onClick={isConnected ? disconnectDevice : connectToDevice}
          className={`${styles.button} ${isConnected ? styles.disconnectButton : ''}`}
        >
          {isConnected ? '断开连接' : '连接设备'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.displayContainer}>
        {shareMode === 'video' ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={styles.video}
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={800}
            height={450}
            className={styles.canvas}
          />
        )}
      </div>
    </div>
  )
}

export default ShareMonitor