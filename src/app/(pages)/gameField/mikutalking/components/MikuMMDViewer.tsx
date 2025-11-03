'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MMDLoader, MMDAnimationHelper } from 'three-stdlib'

interface MikuMMDViewerProps {
  modelBasePath?: string // 模型所在的目录路径，用于加载纹理和模型文件
  motionPath?: string
  cameraPath?: string
  audioPath?: string
  autoPlay?: boolean
  onLoad?: (model: any) => void
  onError?: (error: Error) => void
  onCameraReady?: (controls: {
    moveCamera: (deltaX: number, deltaY: number) => void
    zoomCamera: (delta: number) => void
    resetCamera: () => void
  }) => void
  onAnimationReady?: (controls: {
    playAnimation: () => Promise<void>
    pauseAnimation: () => void
    resumeAnimation: () => void
    stopAnimation: () => void
    isPlaying: boolean
    progress: number
  }) => void
}

/**
 * 米库说话专用MMD查看器
 * 完全独立实现，不依赖其他MMD组件
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
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const helperRef = useRef<MMDAnimationHelper | null>(null)
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationControlsRef = useRef<any>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)

  /**
   * 初始化Three.js场景
   */
  const initThreeJS = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // 创建场景
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xe8f4f8)
    scene.fog = new THREE.Fog(0xe8f4f8, 20, 100)
    sceneRef.current = scene

    // 创建相机
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 10, 25)
    cameraRef.current = camera

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 添加光源（增强光照）
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
    scene.add(ambientLight)

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight1.position.set(20, 30, 20)
    directionalLight1.castShadow = true
    directionalLight1.shadow.mapSize.width = 2048
    directionalLight1.shadow.mapSize.height = 2048
    scene.add(directionalLight1)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight2.position.set(-20, 20, -20)
    scene.add(directionalLight2)
    
    // 添加点光源在模型附近
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 50)
    pointLight.position.set(0, 15, 10)
    scene.add(pointLight)
    

    // 添加地面
    const groundGeometry = new THREE.CircleGeometry(30, 32)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4e5f0,
      roughness: 0.8,
      metalness: 0.2,
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // 添加网格辅助线（可选）
    const gridHelper = new THREE.GridHelper(60, 60, 0xcccccc, 0xe0e0e0)
    gridHelper.position.y = 0.01
    scene.add(gridHelper)

    // 创建控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 8, 0)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 5
    controls.maxDistance = 100
    controls.maxPolarAngle = Math.PI / 2
    controlsRef.current = controls

    // 开始渲染循环
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      if (controlsRef.current) {
        controlsRef.current.update()
      }

      // 更新MMD动画
      if (helperRef.current) {
        helperRef.current.update(clockRef.current.getDelta())
      }

      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
    animate()

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
        
        // 初始化MMDAnimationHelper
        if (!helperRef.current) {
          helperRef.current = new MMDAnimationHelper()
        }
        
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
        
        // 加载动作文件 (VMD)
        console.log('🎭 开始加载MMD动作:', motionPath)
        if (!skinnedMesh) {
          throw new Error('SkinnedMesh不存在')
        }
        const vmd = await new Promise<any>((resolve, reject) => {
          loader.loadAnimation(motionPath, skinnedMesh!, (animation: any) => {
            resolve(animation)
          }, undefined, reject)
        })
        
        console.log('✅ VMD动画加载成功')
        
        // 加载相机动画 (如果有)
        let cameraAnimation = null
        if (cameraPath && cameraRef.current) {
          console.log('📹 开始加载相机动画:', cameraPath)
          try {
            cameraAnimation = await new Promise<any>((resolve, reject) => {
              loader.loadAnimation(cameraPath, cameraRef.current!, (animation: any) => {
                resolve(animation)
              }, undefined, reject)
            })
            console.log('✅ 相机动画加载成功')
          } catch (err) {
            console.warn('⚠️ 相机动画加载失败,继续播放:', err)
          }
        }
        
        // 添加到helper
        helperRef.current.add(skinnedMesh, {
          animation: vmd,
          physics: false
        })
        
        // 添加相机动画（专业MMD运镜效果）
        if (cameraAnimation && cameraRef.current) {
          helperRef.current.add(cameraRef.current, {
            animation: cameraAnimation
          })
          console.log('✅ 相机动画已添加到helper')
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
        console.log('✅ MMD动作播放开始')
      } catch (error) {
        console.error('❌ MMD动作加载失败:', error)
        setIsAnimationPlaying(false)
        if (onError) {
          onError(error as Error)
        }
      }
    }

    const pauseAnimation = () => {
      console.log('⏸️ 请求暂停动画')
      setIsAnimationPlaying(prev => {
        if (prev) {
          if (audioRef.current) {
            audioRef.current.pause()
          }
          clockRef.current.stop()
          console.log('✅ MMD动作播放已暂停')
        }
        return false
      })
    }

    const resumeAnimation = () => {
      console.log('▶️ 请求恢复播放')
      if (helperRef.current) {
        setIsAnimationPlaying(prev => {
          if (!prev) {
            if (audioRef.current && !audioRef.current.ended) {
              audioRef.current.play().catch(err => console.error('音频播放失败:', err))
            }
            clockRef.current.start()
            console.log('✅ MMD动作播放已恢复')
          }
          return true
        })
      } else {
        console.warn('⚠️ helper未初始化，无法恢复播放')
      }
    }

    const stopAnimation = () => {
      console.log('⏹️ 请求停止动画')
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
              helperRef.current.remove(child)
            }
          })
        }
        // 移除相机动画
        if (cameraRef.current) {
          helperRef.current.remove(cameraRef.current)
        }
        helperRef.current = null
      }
      
      clockRef.current.stop()
      console.log('✅ MMD动作播放已停止')
    }

    // 存储控制函数到 ref
    if (!animationControlsRef.current) {
      animationControlsRef.current = {
        playAnimation,
        pauseAnimation,
        resumeAnimation,
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
      console.log('❌ sceneRef.current 为空')
      return
    }

    setLoading(true)
    setError(null)
    setLoadingProgress(10)

    try {
      // 使用 MMDLoader 加载模型（支持骨骼和动画）
      setLoadingProgress(20)
      const loader = new MMDLoader()
      
      // 设置材质路径（用于加载纹理）
      loader.setResourcePath(modelBasePath + '/')
      
      setLoadingProgress(40)
      
      // 直接从public目录加载模型文件
      const modelUrl = `${modelBasePath}/miku.pmx`
      console.log('🎭 开始加载MMD模型:', modelUrl)
      
      // 加载模型
      const mesh = await loader.loadAsync(modelUrl, (progress) => {
        const percent = (progress.loaded / progress.total) * 40 + 40
        setLoadingProgress(Math.min(percent, 80))
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

      setLoadingProgress(100)
      setLoading(false)
      console.log('✅ MMD模型加载成功 (使用MMDLoader)')
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
   * 构建Three.js模型
   */
  const buildThreeJSModel = (pmxData: any): THREE.Group => {
    const group = new THREE.Group()

    if (!pmxData.vertices || !pmxData.faces) {
      throw new Error('模型数据不完整')
    }
    
    // 准备顶点数据
    const positions = new Float32Array(pmxData.vertices.length * 3)
    const normals = new Float32Array(pmxData.vertices.length * 3)
    const uvs = new Float32Array(pmxData.vertices.length * 2)

    pmxData.vertices.forEach((vertex: any, i: number) => {
      // 位置
      positions[i * 3] = vertex.position[0]
      positions[i * 3 + 1] = vertex.position[1]
      positions[i * 3 + 2] = vertex.position[2]

      // 法线
      normals[i * 3] = vertex.normal[0]
      normals[i * 3 + 1] = vertex.normal[1]
      normals[i * 3 + 2] = vertex.normal[2]

      // UV坐标
      if (vertex.uv) {
        uvs[i * 2] = vertex.uv[0]
        uvs[i * 2 + 1] = vertex.uv[1] // 不翻转，因为纹理会通过flipY处理
      }
    })

    // 所有面索引
    const allIndices: number[] = []
    pmxData.faces.forEach((face: any) => {
      // face可能是数组[v1, v2, v3]或者是对象
      if (Array.isArray(face)) {
        allIndices.push(face[0], face[1], face[2])
      } else if (typeof face === 'object') {
        // 可能是对象形式 {indices: [v1, v2, v3]} 或 {a, b, c}
        if (face.indices) {
          allIndices.push(face.indices[0], face.indices[1], face.indices[2])
        } else if (face.a !== undefined) {
          allIndices.push(face.a, face.b, face.c)
        }
      } else {
        // 直接是3个连续的数字
        allIndices.push(face)
      }
    })
    

    // 创建材质和网格（按材质分组）
    const materials = pmxData.materials || []
    let indexOffset = 0
    
    // 材质加载（静默）

    if (materials.length === 0) {
      // 没有材质信息，使用默认材质
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
      geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
      geometry.setIndex(allIndices)
      geometry.computeBoundingBox()
      geometry.computeBoundingSphere()
      
      const defaultMaterial = new THREE.MeshPhongMaterial({
        color: 0x39c5bb,
        side: THREE.DoubleSide,
        shininess: 30,
      })
      const mesh = new THREE.Mesh(geometry, defaultMaterial)
      mesh.castShadow = true
      mesh.receiveShadow = true
      group.add(mesh)
    } else {
      // 按材质创建多个mesh，每个使用正确的索引范围
      materials.forEach((material: any, index: number) => {
        const faceCount = material.faceCount || 0
        if (faceCount === 0) return

        // faceCount是面的数量，每个面有3个顶点索引
        const indexCount = faceCount * 3

        // 创建材质颜色
        const diffuseColor = new THREE.Color(
          material.diffuse?.[0] ?? 0.8,
          material.diffuse?.[1] ?? 0.8,
          material.diffuse?.[2] ?? 0.8
        )
        
        const opacity = material.diffuse?.[3] !== undefined ? material.diffuse[3] : 1.0
        
        // 创建Three.js材质
        const threeMaterial = new THREE.MeshPhongMaterial({
          color: diffuseColor,
          side: THREE.DoubleSide,
          shininess: material.shininess || 30,
          transparent: opacity < 0.99,
          opacity: opacity,
          flatShading: false,
          emissive: new THREE.Color(0x000000),
          specular: new THREE.Color(0x111111),
        })
        
        // 加载纹理（使用textureIndex从pmxData.textures获取）
        if (material.textureIndex !== undefined && material.textureIndex >= 0 && pmxData.textures) {
          const textureFileName = pmxData.textures[material.textureIndex]
          if (textureFileName) {
            const textureLoader = new THREE.TextureLoader()
            // 将反斜杠替换为正斜杠，并使用模型基础路径
            const normalizedPath = textureFileName.replace(/\\/g, '/')
            const texturePath = `${modelBasePath}/${normalizedPath}`
            
            textureLoader.load(
              texturePath,
              (texture) => {
                texture.wrapS = THREE.RepeatWrapping
                texture.wrapT = THREE.RepeatWrapping
                texture.flipY = false
                texture.colorSpace = THREE.SRGBColorSpace
                threeMaterial.map = texture
                threeMaterial.needsUpdate = true
              },
              undefined,
              (error) => {
                console.warn(`纹理加载失败 [${material.name}]: ${texturePath}`)
              }
            )
          }
        }
        
        // 加载球面贴图（spa）
        if (material.sphereTextureIndex !== undefined && material.sphereTextureIndex >= 0 && pmxData.textures) {
          const spaFileName = pmxData.textures[material.sphereTextureIndex]
          if (spaFileName) {
            const textureLoader = new THREE.TextureLoader()
            // 将反斜杠替换为正斜杠，并使用模型基础路径
            const normalizedPath = spaFileName.replace(/\\/g, '/')
            const spaPath = `${modelBasePath}/${normalizedPath}`
            
            textureLoader.load(
              spaPath,
              (texture) => {
                texture.wrapS = THREE.RepeatWrapping
                texture.wrapT = THREE.RepeatWrapping
                texture.flipY = false
                texture.colorSpace = THREE.SRGBColorSpace
                threeMaterial.envMap = texture
                threeMaterial.combine = THREE.MultiplyOperation
                threeMaterial.reflectivity = 0.3
                threeMaterial.needsUpdate = true
              },
              undefined,
              (error) => {
                console.warn(`SPA纹理加载失败 [${material.name}]: ${spaPath}`)
              }
            )
          }
        }

        // 为这个材质创建独立的几何体
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
        
        // 只设置属于这个材质的面索引（注意：每个面有3个索引）
        const materialIndices = allIndices.slice(indexOffset, indexOffset + indexCount)
        
        // 使用Uint32Array（如果索引值超过65535）或Uint16Array
        const maxIndex = Math.max(...materialIndices)
        const indexArray = maxIndex > 65535 
          ? new Uint32Array(materialIndices)
          : new Uint16Array(materialIndices)
        
        geometry.setIndex(new THREE.BufferAttribute(indexArray, 1))
        

        const mesh = new THREE.Mesh(geometry, threeMaterial)
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.name = `Material_${index}`
        group.add(mesh)

        indexOffset += indexCount
      })
    }

    return group
  }

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
      
      // 清理
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      if (modelRef.current && sceneRef.current) {
        sceneRef.current.remove(modelRef.current)
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
      
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

