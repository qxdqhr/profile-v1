'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MMDLoader, MMDAnimationHelper } from 'three-stdlib'
interface MMDPlayerProps {
  modelPath: string
  motionPath?: string
  cameraPath?: string
  audioPath?: string
  autoPlay?: boolean
  onLoad?: () => void
  onError?: (error: Error) => void
}

/**
 * 完整的MMD播放器组件
 * 支持模型、动作、镜头、音频的完整播放
 */
export default function MMDPlayer({
  modelPath,
  motionPath,
  cameraPath,
  audioPath,
  autoPlay = false,
  onLoad,
  onError,
}: MMDPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const helperRef = useRef<MMDAnimationHelper | null>(null)
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationIdRef = useRef<number | null>(null)

  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // 初始化场景
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // 创建场景
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    sceneRef.current = scene

    // 创建相机
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000)
    camera.position.set(0, 10, 30)
    cameraRef.current = camera

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 添加光源
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // 添加网格
    const gridHelper = new THREE.PolarGridHelper(30, 10)
    scene.add(gridHelper)

    // 创建控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 10, 0)
    controls.update()
    controlsRef.current = controls

    // 处理窗口大小变化
    const handleResize = () => {
      if (!container || !camera || !renderer) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }
    window.addEventListener('resize', handleResize)

    // 开始动画循环
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      
      if (helperRef.current) {
        helperRef.current.update(clockRef.current.getDelta())
      }
      
      if (controlsRef.current) {
        controlsRef.current.update()
      }
      
      if (renderer && scene && camera) {
        renderer.render(scene, camera)
      }
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (renderer) {
        renderer.dispose()
        container.removeChild(renderer.domElement)
      }
      if (controls) {
        controls.dispose()
      }
    }
  }, [])

  // 加载MMD资源
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current) return

    const loadMMD = async () => {
      try {
        setLoading(true)
        setLoadingProgress(0)

        const loader = new MMDLoader()
        const helper = new MMDAnimationHelper()
        helperRef.current = helper

        // 加载模型
        setLoadingProgress(20)
        console.log('🎭 开始加载模型:', modelPath)
        
        const mesh = await loader.loadAsync(modelPath, (progress) => {
          const percent = (progress.loaded / progress.total) * 40 + 20
          setLoadingProgress(Math.min(percent, 60))
        })

        if (!sceneRef.current) {
          throw new Error('场景未初始化')
        }

        sceneRef.current.add(mesh)
        console.log('✅ 模型加载成功')

        // 加载动作
        if (motionPath) {
          setLoadingProgress(60)
          console.log('💃 开始加载动作:', motionPath)
          
          const vmd = await loader.loadAsync(motionPath, (progress: any) => {
            const percent = (progress.loaded / progress.total) * 20 + 60
            setLoadingProgress(Math.min(percent, 80))
          })

          helper.add(mesh, {
            animation: vmd as any,
            physics: true
          })
          
          console.log('✅ 动作加载成功')
        } else {
          helper.add(mesh, { physics: true })
        }

        // 加载镜头动画
        if (cameraPath && cameraRef.current) {
          setLoadingProgress(80)
          console.log('📷 开始加载镜头:', cameraPath)
          
          const cameraVmd = await loader.loadAsync(cameraPath)
          helper.add(cameraRef.current, { animation: cameraVmd as any })
          
          console.log('✅ 镜头加载成功')
        }

        // 加载音频
        if (audioPath) {
          setLoadingProgress(90)
          console.log('🎵 开始加载音频:', audioPath)
          
          const audio = new Audio(audioPath)
          audio.volume = 0.5
          audioRef.current = audio
          
          // 监听音频结束事件
          audio.onended = () => {
            setIsPlaying(false)
            if (helperRef.current && sceneRef.current) {
              const mesh = sceneRef.current.children.find(
                (child) => child.type === 'SkinnedMesh'
              )
              if (mesh) {
                helperRef.current.pose(mesh as any, {})
              }
            }
          }
          
          console.log('✅ 音频加载成功')
        }

        setLoadingProgress(100)
        setLoading(false)
        
        console.log('🎉 所有资源加载完成！')
        
        // 如果autoPlay为true，自动播放
        if (autoPlay) {
          setTimeout(() => play(), 500)
        }

        onLoad?.()
      } catch (err: any) {
        console.error('❌ MMD加载失败:', err)
        setError(err.message || '加载失败')
        setLoading(false)
        onError?.(err)
      }
    }

    loadMMD()
  }, [modelPath, motionPath, cameraPath, audioPath, autoPlay, onLoad, onError])

  // 播放控制
  const play = () => {
    if (!helperRef.current) return
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
    
    helperRef.current.enable('animation', true)
    helperRef.current.enable('ik', true)
    helperRef.current.enable('grant', true)
    helperRef.current.enable('physics', true)
    
    clockRef.current.start()
    setIsPlaying(true)
    
    console.log('▶️ 开始播放')
  }

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
    console.log('⏸️ 暂停播放')
  }

  const stop = () => {
    if (helperRef.current && sceneRef.current) {
      const mesh = sceneRef.current.children.find(
        (child) => child.type === 'SkinnedMesh'
      )
      if (mesh) {
        helperRef.current.pose(mesh as any, {})
      }
    }
    
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    
    clockRef.current.stop()
    setIsPlaying(false)
    console.log('⏹️ 停止播放')
  }

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
        <div className="text-2xl mb-4">🎭 加载MMD资源中...</div>
        <div className="w-3/4 max-w-md bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-400">{Math.round(loadingProgress)}%</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-900 text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-xl">加载失败</div>
          <div className="text-sm mt-2 text-gray-300">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* 播放控制按钮 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full">
        {!isPlaying ? (
          <button
            onClick={play}
            className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white text-xl transition-colors"
            title="播放"
          >
            ▶️
          </button>
        ) : (
          <button
            onClick={pause}
            className="w-12 h-12 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center text-white text-xl transition-colors"
            title="暂停"
          >
            ⏸️
          </button>
        )}
        
        <button
          onClick={stop}
          className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xl transition-colors"
          title="停止"
        >
          ⏹️
        </button>
      </div>
    </div>
  )
}

