'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MMDLoader, MMDAnimationHelper } from 'three-stdlib'

/**
 * ========================================
 * 全局类型声明和状态管理
 * ========================================
 */

/** 调试模式开关 - 设为 false 可关闭所有调试日志 */
const DEBUG_MODE = false

/** 调试日志辅助函数 */
const debugLog = (...args: any[]) => {
  if (DEBUG_MODE) console.log(...args)
}

const debugWarn = (...args: any[]) => {
  if (DEBUG_MODE) console.warn(...args)
}

const debugError = (...args: any[]) => {
  // 错误始终显示
  console.error(...args)
}

/** 声明全局 Ammo 物理引擎类型 */
declare global {
  interface Window {
    Ammo: any
  }
}

/** Ammo.js 物理引擎初始化状态（全局单例） */
let ammoInitialized = false
/** Ammo.js 初始化Promise，用于避免重复初始化 */
let ammoInitPromise: Promise<void> | null = null

/**
 * 初始化 Ammo.js 物理引擎
 * 
 * 功能说明：
 * - 从本地文件异步加载 Ammo.js 物理引擎
 * - 使用单例模式，避免重复加载
 * - 支持 WASM 版本，性能更优
 * - MMD 模型的物理效果（如头发、裙摆飘动）依赖此引擎
 * 
 * @returns Promise<void> - 初始化完成时 resolve
 */
async function initAmmo() {
  // 如果已经初始化，直接返回
  if (ammoInitialized) {
    return
  }
  
  // 如果正在初始化中，返回现有的 Promise
  if (ammoInitPromise) {
    return ammoInitPromise
  }
  
  ammoInitPromise = new Promise(async (resolve, reject) => {
    try {
      // 检查是否已经加载过
      if (typeof window !== 'undefined' && window.Ammo) {
        ammoInitialized = true
        debugLog('✅ Ammo.js 已存在')
        resolve()
        return
      }
      
             if (DEBUG_MODE) debugLog('🔧 开始加载 Ammo.js 物理引擎（本地文件）...')
      
      // 动态创建 script 标签加载 ammo.js
      const script = document.createElement('script')
      script.src = '/mikutalking/libs/ammo.wasm.js'  // WASM 版本的物理引擎
      script.async = true
      
      script.onload = async () => {
        debugLog('✅ Ammo.js 脚本加载成功')
        
        // 等待 Ammo 函数可用（异步加载需要时间）
        let retries = 0
        while (typeof (window as any).Ammo !== 'function' && retries < 50) {
          await new Promise(r => setTimeout(r, 100))  // 每100ms检查一次
          retries++
        }
        
        if (typeof (window as any).Ammo !== 'function') {
          reject(new Error('Ammo 函数未定义'))
          return
        }
        
        try {
          // 初始化 Ammo 模块（会自动加载 ammo.wasm.wasm 文件）
          const AmmoLib = await (window as any).Ammo({
            locateFile: (path: string) => {
              // 指定 WASM 文件的位置
              if (path.endsWith('.wasm')) {
                return '/mikutalking/libs/ammo.wasm.wasm'
              }
              return path
            }
          })
          
          // 将初始化后的 Ammo 挂载到全局
          window.Ammo = AmmoLib
          ammoInitialized = true
          debugLog('✅ Ammo.js 物理引擎初始化成功（本地文件）')
          resolve()
        } catch (error) {
          debugError('❌ Ammo.js 初始化失败:', error)
          reject(error)
        }
      }
      
      script.onerror = (error) => {
        debugError('❌ Ammo.js 本地文件加载失败:', error)
        reject(error)
      }
      
      document.head.appendChild(script)
    } catch (error) {
      debugError('❌ Ammo.js 加载失败:', error)
      reject(error)
    }
  })
  
  return ammoInitPromise
}

/**
 * ========================================
 * 组件属性接口定义
 * ========================================
 */

/**
 * MMD查看器组件的属性接口
 */
interface MikuMMDViewerProps {
  /** 模型所在的目录路径，用于正确加载纹理和模型文件 */
  modelBasePath?: string
  /** VMD 动作文件路径 */
  motionPath?: string
  /** VMD 相机动画文件路径（可选） */
  cameraPath?: string
  /** 音频文件路径（可选） */
  audioPath?: string
  /** 是否自动播放动画（保留，暂未使用） */
  autoPlay?: boolean
  /** 模型加载完成回调 */
  onLoad?: (model: any) => void
  /** 模型加载错误回调 */
  onError?: (error: Error) => void
  /** 相机控制就绪回调 - 提供相机操作方法 */
  onCameraReady?: (controls: {
    moveCamera: (deltaX: number, deltaY: number) => void
    zoomCamera: (delta: number) => void
    elevateCamera: (delta: number) => void
    resetCamera: () => void
  }) => void
  /** 动画控制就绪回调 - 提供动画播放控制方法 */
  onAnimationReady?: (controls: {
    playAnimation: () => Promise<void>
    stopAnimation: () => void
    isPlaying: boolean
    progress: number
  }) => void
}

/**
 * ========================================
 * 米库说话专用 MMD 查看器组件
 * ========================================
 * 
 * 功能说明：
 * - 完全独立的 MMD 模型查看器实现
 * - 支持 PMX 模型格式
 * - 支持 VMD 动作和相机动画
 * - 集成 Ammo.js 物理引擎（头发、裙摆等物理效果）
 * - 提供相机控制（旋转、缩放、重置）
 * - 提供动画播放控制（播放、暂停、停止）
 * - 支持音频同步
 * 
 * 技术栈：
 * - Three.js - 3D渲染引擎
 * - three-stdlib - MMD加载器和辅助工具
 * - Ammo.js - 物理引擎（WASM版本）
 * - OrbitControls - 轨道相机控制器
 * 
 * @component
 */
export default function MikuMMDViewer({
  modelBasePath = '/mikutalking/models/YYB_Z6SakuraMiku', // 默认使用新Sakura Miku模型的路径
  motionPath,
  cameraPath,
  audioPath,
  onLoad,
  onError,
  onCameraReady,
  onAnimationReady,
}: MikuMMDViewerProps) {
  
  // ========================================
  // Refs - 持久化对象引用
  // ========================================
  
  /** 容器 DOM 引用 */
  const containerRef = useRef<HTMLDivElement>(null)
  /** Three.js 渲染器引用 */
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  /** Three.js 场景引用 */
  const sceneRef = useRef<THREE.Scene | null>(null)
  /** Three.js 相机引用 */
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  /** 轨道控制器引用 */
  const controlsRef = useRef<OrbitControls | null>(null)
  /** MMD 模型引用 */
  const modelRef = useRef<THREE.Group | null>(null)
  /** 动画帧ID引用，用于取消动画循环 */
  const animationFrameRef = useRef<number | null>(null)
  /** MMD 动画辅助器引用 */
  const helperRef = useRef<MMDAnimationHelper | null>(null)
  /** Three.js 时钟，用于计算动画时间差 */
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())
  /** 音频元素引用 */
  const audioRef = useRef<HTMLAudioElement | null>(null)
  /** 动画控制器引用（用于暂停/恢复等操作） */
  const animationControlsRef = useRef<any>(null)
  /** 帧计数器，用于性能监控 */
  const frameCountRef = useRef<number>(0)
  /** 保存模型初始骨骼状态，用于停止后恢复 */
  const initialBonesStateRef = useRef<Map<string, { position: THREE.Vector3, quaternion: THREE.Quaternion, scale: THREE.Vector3 }>>(new Map())

  // ========================================
  // 状态管理
  // ========================================
  
  /** 是否正在加载模型 */
  const [loading, setLoading] = useState(true)
  /** 错误信息 */
  const [error, setError] = useState<string | null>(null)
  /** 模型加载进度 (0-100) */
  const [loadingProgress, setLoadingProgress] = useState(0)
  /** 动画是否正在播放 */
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false)
  /** 动画播放进度 (0-100) */
  const [animationProgress, setAnimationProgress] = useState(0)

  /**
   * ========================================
   * 初始化 Three.js 场景
   * ========================================
   * 
   * 功能说明：
   * - 创建Three.js渲染器、场景、相机
   * - 设置光照系统（环境光+方向光+点光源）
   * - 添加地面和网格辅助线
   * - 配置轨道控制器
   * - 启动渲染循环
   * - 暴露相机控制方法
   */
  const initThreeJS = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // ===== 创建场景 =====
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xe8f4f8)  // 浅蓝色背景
    scene.fog = new THREE.Fog(0xe8f4f8, 20, 100)  // 添加雾效果
    sceneRef.current = scene

    // ===== 创建透视相机 =====
    const camera = new THREE.PerspectiveCamera(
      45,              // 视角
      width / height,  // 宽高比
      0.1,             // 近裁剪面
      1000             // 远裁剪面
    )
    camera.position.set(0, 10, 25)  // 初始位置
    cameraRef.current = camera

    // ===== 创建WebGL渲染器 =====
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,  // 抗锯齿
      alpha: true       // 支持透明背景
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))  // 限制像素比率
    renderer.shadowMap.enabled = true                             // 启用阴影
    renderer.shadowMap.type = THREE.PCFSoftShadowMap             // 柔和阴影
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // ===== 光照系统 =====
    
    // 环境光 - 提供基础照明
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
    scene.add(ambientLight)

    // 方向光1 - 主光源（带阴影）
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight1.position.set(20, 30, 20)
    directionalLight1.castShadow = true
    directionalLight1.shadow.mapSize.width = 2048   // 阴影贴图分辨率
    directionalLight1.shadow.mapSize.height = 2048
    scene.add(directionalLight1)

    // 方向光2 - 辅助光源
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight2.position.set(-20, 20, -20)
    scene.add(directionalLight2)
    
    // 点光源 - 模型附近补光
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 50)
    pointLight.position.set(0, 15, 10)
    scene.add(pointLight)
    

    // ===== 添加地面 =====
    const groundGeometry = new THREE.CircleGeometry(30, 32)  // 圆形地面
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4e5f0,    // 浅蓝色
      roughness: 0.8,     // 粗糙度
      metalness: 0.2,     // 金属感
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2  // 旋转至水平
    ground.receiveShadow = true       // 接收阴影
    scene.add(ground)

     // ===== 添加网格辅助线（调试用，可选）=====
     // const gridHelper = new THREE.GridHelper(60, 60, 0xcccccc, 0xe0e0e0)
     // gridHelper.position.y = 0.01  // 略高于地面，避免z-fighting
     // scene.add(gridHelper)

    // ===== 创建轨道控制器 =====
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 8, 0)       // 控制器目标点（模型中心）
    controls.enableDamping = true      // 启用阻尼（惯性）
    controls.dampingFactor = 0.05      // 阻尼系数
    controls.minDistance = 5           // 最小缩放距离
    controls.maxDistance = 100         // 最大缩放距离
    controls.maxPolarAngle = Math.PI / 2  // 限制垂直旋转角度（不能看到地面下方）
    controlsRef.current = controls

    // ===== 启动渲染循环 =====
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      // 更新控制器
      if (controlsRef.current) {
        controlsRef.current.update()
      }

      // 更新 MMD 动画和物理
      if (helperRef.current) {
        const delta = clockRef.current.getDelta()  // 获取时间增量
        helperRef.current.update(delta)            // 更新动画帧
        
        // 定期打印物理系统状态（调试用）
        frameCountRef.current++
        if (frameCountRef.current % 120 === 0) {  // 每120帧（约2秒）
          const helper = helperRef.current as any
          debugLog('🎪 物理系统状态:', {
            frame: frameCountRef.current,
            delta: delta.toFixed(4),
            physicsEnabled: !!helper.physics,
            objectCount: helper.objects?.size || 0
          })
        }
      }

      // 渲染场景
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
    animate()  // 开始动画循环

    // 暴露相机控制方法
    if (onCameraReady) {
            onCameraReady({
              moveCamera: (deltaX: number, deltaY: number) => {
                if (controlsRef.current && cameraRef.current) {
                  // 获取当前相机和目标位置
                  const camera = cameraRef.current
                  const target = controlsRef.current.target
                  
                  // 计算相机相对于目标的位置
                  const offset = new THREE.Vector3().subVectors(camera.position, target)
                  
                  // 转换为球坐标
                  const spherical = new THREE.Spherical().setFromVector3(offset)
                  
                  // 应用旋转（deltaX 影响方位角，deltaY 影响极角）
                  spherical.theta -= deltaX
                  spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - deltaY))
                  
                  // 转换回笛卡尔坐标
                  offset.setFromSpherical(spherical)
                  
                  // 更新相机位置
                  camera.position.copy(target).add(offset)
                  controlsRef.current.update()
                }
              },
        zoomCamera: (delta: number) => {
          if (cameraRef.current && controlsRef.current) {
            const distance = cameraRef.current.position.distanceTo(controlsRef.current.target)
            const newDistance = Math.max(5, Math.min(100, distance + delta * 10))
            
            const direction = new THREE.Vector3()
            direction.subVectors(cameraRef.current.position, controlsRef.current.target).normalize()
            cameraRef.current.position.copy(controlsRef.current.target).add(direction.multiplyScalar(newDistance))
          }
        },
        elevateCamera: (delta: number) => {
          if (cameraRef.current && controlsRef.current) {
            // 沿 Z 轴（上下方向）移动相机和目标点
            const elevationAmount = delta * 2 // 调整灵敏度
            cameraRef.current.position.z += elevationAmount
            controlsRef.current.target.z += elevationAmount
            controlsRef.current.update()
          }
        },
        resetCamera: () => {
          if (cameraRef.current && controlsRef.current) {
            cameraRef.current.position.set(0, 25, 25)
            controlsRef.current.target.set(0, 8, 0)
            controlsRef.current.update()
          }
        }
      })
    }

  }, [onCameraReady])

  /**
   * 暴露动作播放控制
   */
  useEffect(() => {
    if (!onAnimationReady || !motionPath) return

    const playAnimation = async () => {
      try {
        setIsAnimationPlaying(true)
        setAnimationProgress(0)
        
        // 先初始化 Ammo.js 物理引擎（物理效果必需）
        await initAmmo()
        
        // 清理旧的 helper（避免物理效果累积）
        if (helperRef.current) {
          debugLog('🧹 清理旧的 MMDAnimationHelper')
          // 移除所有对象
          if (modelRef.current) {
            modelRef.current.traverse((child) => {
              if (child instanceof THREE.SkinnedMesh) {
                try {
                  helperRef.current?.remove(child)
                } catch (e) {
                  // 忽略错误
                }
              }
            })
          }
          if (cameraRef.current) {
            try {
              helperRef.current.remove(cameraRef.current)
            } catch (e) {
              // 忽略错误
            }
          }
          // 销毁旧 helper，强制重建物理世界
          helperRef.current = null
        }
        
        // 重新创建 MMDAnimationHelper（确保物理世界干净）
        helperRef.current = new MMDAnimationHelper()
        debugLog('🎬 MMDAnimationHelper已重新初始化（物理世界已重置）')
        debugLog('  - 物理引擎:', (helperRef.current as any).physics ? '可用' : '不可用')
        debugLog('  - Ammo.js:', typeof window !== 'undefined' && window.Ammo ? '已加载' : '未加载')
        
        const loader = new MMDLoader()
        const model = modelRef.current
        
        if (!model) {
          throw new Error('模型未加载')
        }
        
        // 查找SkinnedMesh
        let skinnedMesh: THREE.SkinnedMesh | null = null
        model.traverse((child) => {
          if (child instanceof THREE.SkinnedMesh) {
            skinnedMesh = child
          }
        })
        
        if (!skinnedMesh) {
          throw new Error('未找到SkinnedMesh')
        }
        
        // 检查模型物理信息
        debugLog('🔍 检查模型物理信息:')
        const meshUserData = (skinnedMesh as any).userData
        debugLog('  - userData:', meshUserData)
        if (meshUserData?.MMD) {
          debugLog('  - MMD数据存在:', {
            bones: meshUserData.MMD.bones?.length,
            morphs: meshUserData.MMD.morphs?.length,
            rigidBodies: meshUserData.MMD.rigidBodies?.length,
            constraints: meshUserData.MMD.constraints?.length
          })
        } else {
          debugWarn('⚠️ 模型缺少MMD userData，物理效果可能无法工作')
        }
        
        // 加载动作文件 (VMD)
        debugLog('🎭 开始加载MMD动作:', motionPath)
        if (!skinnedMesh) {
          throw new Error('SkinnedMesh不存在')
        }
        const vmd = await new Promise<any>((resolve, reject) => {
          loader.loadAnimation(motionPath, skinnedMesh!, (animation: any) => {
            resolve(animation)
          }, undefined, reject)
        })
        
        debugLog('✅ VMD动画加载成功')
        
        // 加载相机动画 (如果有)
        let cameraAnimation = null
        if (cameraPath && cameraRef.current) {
          debugLog('📹 开始加载相机动画:', cameraPath)
          try {
            cameraAnimation = await new Promise<any>((resolve, reject) => {
              loader.loadAnimation(cameraPath, cameraRef.current!, (animation: any) => {
                resolve(animation)
              }, undefined, reject)
            })
            debugLog('✅ 相机动画加载成功')
          } catch (err) {
            debugWarn('⚠️ 相机动画加载失败,继续播放:', err)
          }
        }
        
        // 添加到helper (启用物理效果)
        debugLog('🎪 添加模型到MMDAnimationHelper，配置:', {
          hasAnimation: !!vmd,
          physics: true,
          hasRigidBodies: meshUserData?.MMD?.rigidBodies?.length > 0
        })
        
        // 先移除旧的模型（避免重复添加错误）
        try {
          helperRef.current.remove(skinnedMesh)
        } catch (e) {
          // 如果模型不存在，忽略错误
        }
        
        // 添加模型到 helper
        helperRef.current.add(skinnedMesh, {
          animation: vmd,
          physics: true
        })
        
        debugLog('✅ 模型已添加到helper，物理效果:', (helperRef.current as any).physics ? '已启用' : '未启用')
        debugLog('  - Helper objects数量:', (helperRef.current as any).objects?.size || 0)
        
        // 添加相机动画（专业MMD运镜效果）
        if (cameraAnimation && cameraRef.current) {
          // 先移除旧的相机动画（避免重复添加错误）
          try {
            helperRef.current.remove(cameraRef.current)
          } catch (e) {
            // 如果相机不存在，忽略错误
          }
          
          helperRef.current.add(cameraRef.current, {
            animation: cameraAnimation
          })
          debugLog('✅ 相机动画已添加到helper')
        }
        
        // 加载音频
        if (audioPath) {
          const audio = new Audio(audioPath)
          audio.volume = 0.7
          audioRef.current = audio
          
          audio.onended = () => {
            setIsAnimationPlaying(false)
            setAnimationProgress(0)
            if (helperRef.current) {
              if (skinnedMesh) {
                helperRef.current.remove(skinnedMesh)
              }
              if (cameraAnimation && cameraRef.current) {
                helperRef.current.remove(cameraRef.current)
              }
              helperRef.current = null
            }
          }
          
          audio.play()
        }
        
        clockRef.current.start()
        debugLog('✅ MMD动作播放开始')
      } catch (error) {
        console.error('❌ MMD动作加载失败:', error)
        setIsAnimationPlaying(false)
        if (onError) {
          onError(error as Error)
        }
      }
    }

    const stopAnimation = () => {
      debugLog('⏹️ 请求停止动画')
      setIsAnimationPlaying(false)
      setAnimationProgress(0)
      
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
      }
      
      if (helperRef.current) {
        // 移除模型动画
        if (modelRef.current) {
          modelRef.current.traverse((child) => {
            if (child instanceof THREE.SkinnedMesh && helperRef.current) {
              try {
                helperRef.current.remove(child)
              } catch (e) {
                // 忽略移除错误
              }
            }
          })
        }
        // 移除相机动画
        if (cameraRef.current) {
          try {
            helperRef.current.remove(cameraRef.current)
          } catch (e) {
            // 忽略移除错误
          }
        }
        helperRef.current = null
      }
      
      // 重置模型到初始状态（恢复加载时保存的骨骼状态）
      if (modelRef.current && initialBonesStateRef.current.size > 0) {
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.SkinnedMesh) {
            // 恢复所有骨骼到初始状态
            if (child.skeleton) {
              child.skeleton.bones.forEach((bone, index) => {
                const key = `${child.uuid}_bone_${index}`
                const initialState = initialBonesStateRef.current.get(key)
                
                if (initialState) {
                  // 恢复初始位置、旋转和缩放
                  bone.position.copy(initialState.position)
                  bone.quaternion.copy(initialState.quaternion)
                  bone.scale.copy(initialState.scale)
                }
              })
              // 更新骨骼矩阵
              child.skeleton.update()
            }
            
            // 重置所有变形目标（morphs）
            if (child.morphTargetInfluences) {
              child.morphTargetInfluences.fill(0)
            }
            
            // 强制更新
            child.updateMatrixWorld(true)
          }
        })
        
        debugLog('✅ 模型已恢复到初始状态')
      }
      
      clockRef.current.stop()
      clockRef.current = new THREE.Clock()  // 重置时钟
      debugLog('✅ MMD动作播放已停止')
    }

    // 存储控制函数到 ref
    if (!animationControlsRef.current) {
      animationControlsRef.current = {
        playAnimation,
        stopAnimation
      }
    }
  }, [motionPath, audioPath, onError])
  
  // 单独的 useEffect 用于通知父组件动画控制就绪，并更新状态
  useEffect(() => {
    if (onAnimationReady && animationControlsRef.current) {
      onAnimationReady({
        ...animationControlsRef.current,
        isPlaying: isAnimationPlaying,
        progress: animationProgress
      })
    }
  }, [isAnimationPlaying, animationProgress, onAnimationReady])

  /**
   * 使用MMDLoader加载PMX模型（支持骨骼动画）
   */
  const loadPMXModel = useCallback(async () => {
    if (!sceneRef.current) {
      debugLog('❌ sceneRef.current 为空')
      return
    }

    setLoading(true)
    setError(null)
    setLoadingProgress(10)

    try {
      // 使用 MMDLoader 加载模型（支持骨骼和动画）
      setLoadingProgress(20)
      
      // 创建 LoadingManager 来拦截并修正纹理路径
      const fixTexturePath = (url: string): string => {
        // 1. 修正中文路径和目录名
        let fixedUrl = url
          .replace(/YYB_Z6[^/]*2\.0/g, 'YYB_Z6SakuraMiku')
          .replace(/%E6%B0%B4%E6%89%8B%E6%A8%B1%E6%9C%AA%E6%9D%A5/g, 'YYB_Z6SakuraMiku')
          .replace(/YYB_Z6水手樱未来2\.0/g, 'YYB_Z6SakuraMiku')
          .replace(/\\/g, '/')  // 统一使用正斜杠
        
        // 2. 检查路径是否已经包含正确的子目录结构
        // 如果 PMX 文件中已经指定了子目录（如 tex\file.png），则直接使用
        const hasSubdir = fixedUrl.match(/\/(spa|toon|tex|tex_02)\/[^/]+$/i)
        
        if (hasSubdir) {
          // 路径已经包含子目录，不需要额外处理
          return fixedUrl
        }
        
        // 3. 如果路径中没有子目录，根据文件名判断应该在哪个子目录
        const fileName = fixedUrl.split('/').pop() || ''
        const lowerFileName = fileName.toLowerCase()
        
        let subdir = ''
        
        // spa 球形贴图 (spa-*.bmp, spa-*.png, km.png)
        if (lowerFileName.startsWith('spa-') || lowerFileName === 'km.png') {
          subdir = 'spa'
        }
        // toon 卡通渲染贴图 (toon-*.bmp, s*.bmp)
        else if (lowerFileName.startsWith('toon-') || /^s\d+\.bmp$/.test(lowerFileName)) {
          subdir = 'toon'
        }
        // tex_02 特殊纹理
        else if (lowerFileName.includes('sakura') || lowerFileName.includes('体-') || 
                 lowerFileName === 'tex.png' || lowerFileName === 'tex2.png' || 
                 lowerFileName.includes('体b')) {
          subdir = 'tex_02'
        }
        // tex 标准纹理
        else if (lowerFileName.endsWith('.png') || lowerFileName.endsWith('.bmp') || 
                 lowerFileName.endsWith('.psd') || lowerFileName.endsWith('.jpg')) {
          subdir = 'tex'
        }
        
        // 4. 在模型基础路径和文件名之间插入子目录
        if (subdir) {
          fixedUrl = fixedUrl.replace(
            new RegExp(`(${modelBasePath.replace(/\//g, '\\/')}/)([^/]+)$`),
            `$1${subdir}/$2`
          )
        }
        
        return fixedUrl
      }
      
      const manager = new THREE.LoadingManager()
      manager.setURLModifier((url) => {
        const fixedUrl = fixTexturePath(url)
        if (url !== fixedUrl) {
          debugLog('🔧 拦截并修正URL:', url.split('/').slice(-2).join('/'), '->', fixedUrl.split('/').slice(-2).join('/'))
        }
        return fixedUrl
      })
      
      const loader = new MMDLoader(manager)
      
      // 设置材质路径（用于加载纹理）
      loader.setResourcePath(modelBasePath + '/')
      
      setLoadingProgress(40)
      
      // 直接从public目录加载模型文件
      const modelUrl = `${modelBasePath}/miku.pmx`
      debugLog('🎭 开始加载MMD模型:', modelUrl)
      
      // 加载模型
      const mesh = await loader.loadAsync(modelUrl, (progress) => {
        const percent = (progress.loaded / progress.total) * 40 + 40
        setLoadingProgress(Math.min(percent, 80))
      })
      
      // 修正纹理路径并清理废弃属性（PMX文件内部可能使用了中文路径）
      mesh.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((mat: any) => {
            // ===== 清理 Three.js 新版本中废弃的材质属性 =====
            // 'combine' 属性在新版本的 MeshToonMaterial 中已被移除
            if (mat.isMeshToonMaterial && 'combine' in mat) {
              delete mat.combine
            }
            // 清理其他可能的废弃属性
            const deprecatedProps = ['combine', 'reflectivity', 'refractionRatio']
            deprecatedProps.forEach(prop => {
              if (prop in mat && mat[prop] !== undefined) {
                delete mat[prop]
              }
            })
            
            // 修正标准纹理属性
            const textureProps = ['map', 'normalMap', 'envMap', 'emissiveMap', 'specularMap', 'matcap', 'gradientMap']
            textureProps.forEach(prop => {
              if (mat[prop] && mat[prop].image && mat[prop].image.src) {
                const oldSrc = mat[prop].image.src
                const fixedSrc = fixTexturePath(oldSrc)
                
                if (oldSrc !== fixedSrc) {
                  debugLog('🔧 修正纹理路径:', oldSrc.split('/').slice(-3).join('/'))
                  debugLog('   -> ', fixedSrc.split('/').slice(-3).join('/'))
                  
                  // 重新加载纹理
                  const textureLoader = new THREE.TextureLoader()
                  textureLoader.load(fixedSrc, (newTexture) => {
                    newTexture.colorSpace = THREE.SRGBColorSpace
                    newTexture.flipY = true
                    mat[prop] = newTexture
                    mat.needsUpdate = true
                  }, undefined, (err) => {
                    debugWarn('⚠️ 纹理加载失败:', fixedSrc, err)
                  })
                }
              }
            })
            
            // 修正 MMD 特有的 userData 中的纹理路径
            if (mat.userData && mat.userData.outlineParameters) {
              const outline = mat.userData.outlineParameters
              if (outline.texture && outline.texture.image && outline.texture.image.src) {
                const oldSrc = outline.texture.image.src
                const fixedSrc = fixTexturePath(oldSrc)
                if (oldSrc !== fixedSrc) {
                  debugLog('🔧 修正轮廓纹理路径')
                  outline.texture.image.src = fixedSrc
                }
              }
            }
          })
        }
      })
      
      setLoadingProgress(80)
      
      // 移除旧模型
      if (modelRef.current) {
        sceneRef.current.remove(modelRef.current)
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose())
            } else {
              child.material.dispose()
            }
          }
        })
      }

      // 创建一个 Group 来包装模型
      const modelGroup = new THREE.Group()
      modelGroup.add(mesh)
      
      // 计算模型的边界框
      const box = new THREE.Box3().setFromObject(modelGroup)
      const size = box.getSize(new THREE.Vector3())
      
      // 将模型移动到地面上（Y轴调整）
      modelGroup.position.y = -box.min.y
      
      // 如果模型太大或太小，进行缩放
      const maxDimension = Math.max(size.x, size.y, size.z)
      const targetSize = 20 // 目标尺寸
      if (maxDimension > 0) {
        const scale = targetSize / maxDimension
        modelGroup.scale.set(scale, scale, scale)
      }
      
      // MMD模型默认朝向就是正面朝向+Z方向的相机
      modelGroup.rotation.y = 0
      
      sceneRef.current.add(modelGroup)
      modelRef.current = modelGroup

      // 保存模型初始骨骼状态（用于停止动画后恢复）
      modelGroup.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh && child.skeleton) {
          child.skeleton.bones.forEach((bone, index) => {
            const key = `${child.uuid}_bone_${index}`
            initialBonesStateRef.current.set(key, {
              position: bone.position.clone(),
              quaternion: bone.quaternion.clone(),
              scale: bone.scale.clone()
            })
          })
        }
      })
      debugLog('✅ 已保存模型初始骨骼状态，骨骼数量:', initialBonesStateRef.current.size)

      setLoadingProgress(100)
      setLoading(false)
      debugLog('✅ MMD模型加载成功 (使用MMDLoader)')
      onLoad?.(modelGroup)

    } catch (err) {
      console.error('❌ 模型加载失败:', err)
      console.error('错误堆栈:', err instanceof Error ? err.stack : '无堆栈信息')
      const errorMessage = err instanceof Error ? err.message : '模型加载失败'
      setError(errorMessage)
      setLoading(false)
      onError?.(err as Error)
    }
  }, [modelBasePath, onLoad, onError])

  /**
   * 处理窗口大小变化
   */
  const handleResize = useCallback(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    cameraRef.current.aspect = width / height
    cameraRef.current.updateProjectionMatrix()
    rendererRef.current.setSize(width, height)
  }, [])

  // 初始化
  useEffect(() => {
    initThreeJS()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      
      // 清理 MMDAnimationHelper
      if (helperRef.current) {
        // 移除所有添加的对象
        if (modelRef.current) {
          modelRef.current.traverse((child) => {
            if (child instanceof THREE.SkinnedMesh) {
              try {
                helperRef.current?.remove(child)
              } catch (e) {
                // 忽略错误
              }
            }
          })
        }
        
        if (cameraRef.current) {
          try {
            helperRef.current.remove(cameraRef.current)
          } catch (e) {
            // 忽略错误
          }
        }
        
        helperRef.current = null
      }
      
      // 清理音频
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      
      // 清理动画帧
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      // 清理场景对象
      if (modelRef.current && sceneRef.current) {
        sceneRef.current.remove(modelRef.current)
      }
      
      // 清理控制器
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
      
      // 清理渲染器
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [initThreeJS, handleResize])

  // 加载模型 - 在场景初始化后自动加载
  useEffect(() => {
    if (sceneRef.current) {
      // 延迟一帧确保场景完全初始化
      const timer = setTimeout(() => {
        loadPMXModel()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [loadPMXModel])

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* 加载遮罩 */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cyan-100/90 to-blue-100/90 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <div className="text-lg font-medium text-gray-700 mb-2">
              加载米库模型中...
            </div>
            <div className="text-sm text-gray-500">
              {loadingProgress}%
            </div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 backdrop-blur-sm z-10">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <div className="text-xl font-bold text-red-600 mb-2">加载失败</div>
            <div className="text-sm text-gray-600 mb-4">{error}</div>
            <button
              onClick={() => {
                setError(null)
                loadPMXModel()
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      )}

      {/* 控制提示 */}
      {!loading && !error && (
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-3 py-1.5 rounded-lg pointer-events-none opacity-60">
          左键旋转 | 滚轮缩放 | 右键平移
        </div>
      )}
    </div>
  )
}

