'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createMMDScene, updateCameraAspect, updateRendererSize, disposeObject } from '../../utils/sceneUtils';
import { TextureManager } from '../../utils/textureManager';
import type { MMDViewerProps } from '../../types';

/**
 * MMD模型查看器组件
 */
export function MMDViewer({
  className = '',
  width = '100%',
  height = '600px',
  modelId,
  animationId,
  audioId,
  autoPlay = false,
  controls = true,
  onLoad,
  onError,
  onProgress,
  localFileData,
}: MMDViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls?: OrbitControls;
    animationId?: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [parseResult, setParseResult] = useState<any>(null);
  const [textureManager] = useState(() => new TextureManager());
  const [debugInfo, setDebugInfo] = useState<{
    materials: any[];
    textures: string[];
    textureMatches: Record<string, string | null>;
  }>({
    materials: [],
    textures: [],
    textureMatches: {}
  });

  /**
   * 初始化Three.js场景
   */
  const initScene = useCallback(() => {
    if (!canvasRef.current || !mountRef.current) return;

    try {
      const container = mountRef.current;
      const rect = container.getBoundingClientRect();
      
      // 创建场景、相机、渲染器
      const { scene, camera, renderer } = createMMDScene(canvasRef.current, {
        width: rect.width,
        height: rect.height,
      });

      // 创建轨道控制器
      let orbitControls: OrbitControls | undefined;
      if (controls) {
        orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.05;
        orbitControls.enableZoom = true;
        orbitControls.enablePan = true;
        orbitControls.enableRotate = true;
        orbitControls.autoRotate = false;
        orbitControls.target.set(0, 0, 0);
      }

      sceneRef.current = {
        scene,
        camera,
        renderer,
        controls: orbitControls,
      };

      // 开始渲染循环
      startRenderLoop();
      
      console.log('MMD Viewer initialized successfully');
    } catch (err) {
      console.error('Failed to initialize MMD Viewer:', err);
      setError('初始化3D场景失败');
      onError?.(err as Error);
    }
  }, [controls, onError]);

  /**
   * 开始渲染循环
   */
  const startRenderLoop = useCallback(() => {
    if (!sceneRef.current) return;

    const { scene, camera, renderer, controls } = sceneRef.current;

    const animate = () => {
      if (!sceneRef.current) return;

      // 更新控制器
      if (controls) {
        controls.update();
      }

      // 渲染场景
      renderer.render(scene, camera);

      // 继续下一帧
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };

    animate();
  }, []);

  /**
   * 停止渲染循环
   */
  const stopRenderLoop = useCallback(() => {
    if (sceneRef.current?.animationId) {
      cancelAnimationFrame(sceneRef.current.animationId);
      sceneRef.current.animationId = undefined;
    }
  }, []);

  /**
   * 处理窗口大小变化
   */
  const handleResize = useCallback(() => {
    if (!sceneRef.current || !mountRef.current) return;

    const container = mountRef.current;
    const rect = container.getBoundingClientRect();
    const { camera, renderer } = sceneRef.current;

    // 更新相机和渲染器
    updateCameraAspect(camera, rect.width, rect.height);
    updateRendererSize(renderer, rect.width, rect.height);
  }, []);

    /**
   * 直接加载ArrayBuffer格式的MMD模型
   */
  const loadModelFromBuffer = useCallback(async (arrayBuffer: ArrayBuffer, fileName: string) => {
    if (!sceneRef.current) return;

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      console.log('开始解析MMD模型:', fileName);

      // 清理现有模型
      const modelsToRemove: THREE.Object3D[] = [];
      sceneRef.current.scene.traverse((child) => {
        if (child.userData.isModel) {
          modelsToRemove.push(child);
        }
      });
      modelsToRemove.forEach(model => {
        sceneRef.current!.scene.remove(model);
        disposeObject(model);
      });

      setProgress(20);

      // 解析MMD文件
      try {
        const mmdParserModule = await import('mmd-parser') as any;
        console.log('MMD Parser module:', Object.keys(mmdParserModule));
        
        // 尝试不同的方式获取Parser构造函数
        let ParserClass;
        if (mmdParserModule.Parser) {
          ParserClass = mmdParserModule.Parser;
        } else if (mmdParserModule.default && mmdParserModule.default.Parser) {
          ParserClass = mmdParserModule.default.Parser;
        } else if (mmdParserModule.MMDParser && mmdParserModule.MMDParser.Parser) {
          ParserClass = mmdParserModule.MMDParser.Parser;
        } else {
          console.error('找不到Parser类:', mmdParserModule);
          throw new Error('无法找到MMD Parser类，请检查mmd-parser库的安装');
        }
        
        const parser = new ParserClass();
        let mmdModel;
        
        if (fileName.toLowerCase().endsWith('.pmx')) {
          mmdModel = parser.parsePmx(arrayBuffer);
        } else if (fileName.toLowerCase().endsWith('.pmd')) {
          mmdModel = parser.parsePmd(arrayBuffer);
        } else if (fileName.toLowerCase().endsWith('.vmd')) {
          mmdModel = parser.parseVmd(arrayBuffer);
        } else {
          throw new Error('不支持的文件格式，仅支持 .pmd, .pmx 和 .vmd 文件');
        }
        
        setProgress(60);

        // 检查文件类型并进行相应处理
        const isVMD = fileName.toLowerCase().endsWith('.vmd');
        
        if (isVMD) {
          // VMD是动画文件，不包含几何体，创建一个占位符显示动画信息
          const animationInfoGroup = new THREE.Group();
          animationInfoGroup.userData.isModel = true;
          animationInfoGroup.userData.modelPath = fileName;
          animationInfoGroup.userData.modelType = 'VMD';
          animationInfoGroup.userData.mmdModel = mmdModel;
          animationInfoGroup.userData.isAnimation = true;
          
          // 创建一个简单的可视化显示动画数据
          const geometry = new THREE.SphereGeometry(1, 8, 6);
          const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.7 
          });
          const sphere = new THREE.Mesh(geometry, material);
          sphere.position.set(0, 1, 0);
          
          // 添加文本标识（如果有TextGeometry的话）
          animationInfoGroup.add(sphere);
          
          setProgress(90);
          sceneRef.current.scene.add(animationInfoGroup);
          setProgress(100);
          setIsLoading(false);
          onLoad?.(animationInfoGroup);

          console.log('VMD动画文件加载完成:', {
            name: mmdModel.header?.name || fileName,
            bones: mmdModel.bone?.length || 0,
            morphs: mmdModel.morph?.length || 0,
            cameras: mmdModel.camera?.length || 0,
            lights: mmdModel.light?.length || 0
          });
          
        } else {
          // PMD/PMX模型文件，构建Three.js模型
          const { MMDModelBuilder } = await import('../../utils/mmdModelBuilder');
          const group = MMDModelBuilder.buildMesh(mmdModel, textureManager);
          
          group.userData.isModel = true;
          group.userData.modelPath = fileName;
          group.userData.modelType = fileName.toLowerCase().endsWith('.pmx') ? 'PMX' : 'PMD';
          group.userData.mmdModel = mmdModel;

          setProgress(90);

          // 添加到场景
          sceneRef.current.scene.add(group);

          setProgress(100);
          setIsLoading(false);
          setParseResult(mmdModel);
          updateDebugInfo(mmdModel); // 更新调试信息
          onLoad?.(group);

          console.log('MMD模型加载完成:', {
            name: mmdModel.metadata?.modelName || fileName,
            vertices: mmdModel.vertices?.length || 0,
            faces: mmdModel.faces?.length || 0,
            materials: mmdModel.materials?.length || 0,
            textures: textureManager.getStats().count
          });
        }

      } catch (parseError: any) {
        console.error('MMD解析失败:', parseError);
        throw new Error(`解析失败: ${parseError?.message || parseError}`);
      }

    } catch (err) {
      console.error('MMD模型加载失败:', err);
      setError('模型解析失败: ' + (err instanceof Error ? err.message : '未知错误'));
      setIsLoading(false);
      onError?.(err as Error);
    }
  }, [onLoad, onError]);

  /**
   * 加载演示模型
   */
  const loadDemoModel = useCallback(() => {
    if (!sceneRef.current) return;

    // 清理现有模型
    const modelsToRemove: THREE.Object3D[] = [];
    sceneRef.current.scene.traverse((child) => {
      if (child.userData.isModel) {
        modelsToRemove.push(child);
      }
    });
    modelsToRemove.forEach(model => {
      sceneRef.current!.scene.remove(model);
      disposeObject(model);
    });

    // 创建简单演示模型
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 1, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.userData.isModel = true;
    sceneRef.current.scene.add(cube);
    
    onLoad?.(cube);
    console.log('演示模型加载完成');
  }, [onLoad]);

  /**
   * 清理资源
   */
  const cleanup = useCallback(() => {
    stopRenderLoop();

    if (sceneRef.current) {
      const { scene, renderer, controls } = sceneRef.current;

      // 清理控制器
      if (controls) {
        controls.dispose();
      }

      // 清理场景对象
      disposeObject(scene);

      // 清理渲染器
      renderer.dispose();

      sceneRef.current = null;
    }
  }, [stopRenderLoop]);

  // 初始化效果
  useEffect(() => {
    initScene();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, [initScene, handleResize, cleanup]);

  // 监听modelId变化 - 现在只支持demo模式
  useEffect(() => {
    if (modelId === 'demo' && sceneRef.current) {
      loadDemoModel();
    }
  }, [modelId, loadDemoModel]);

  // 监听本地文件数据变化
  useEffect(() => {
    if (localFileData && sceneRef.current) {
      console.log('检测到本地文件数据，开始解析:', localFileData.name);
      
      // 处理纹理文件
      if (localFileData.textureFiles) {
        console.log('加载纹理文件...');
        textureManager.clear(); // 清理之前的纹理
        localFileData.textureFiles.forEach((file, fileName) => {
          textureManager.addTexture(file);
        });
        const stats = textureManager.getStats();
        console.log(`已加载 ${stats.count} 个纹理文件，总大小: ${stats.totalSizeMB}MB`);
      }
      
      loadModelFromBuffer(localFileData.arrayBuffer, localFileData.name);
    }
  }, [localFileData, loadModelFromBuffer]);

  // 监听进度变化
  useEffect(() => {
    if (onProgress) {
      onProgress(progress);
    }
  }, [progress, onProgress]);

  // 新增调试信息更新
  const updateDebugInfo = useCallback((mmdModel: any) => {
    console.log(`🐛 [updateDebugInfo] 开始更新调试信息`);
    
    const materials = mmdModel?.materials || [];
    const textures = textureManager.listTextures();
    const textureMatches: Record<string, string | null> = {};
    
    console.log(`🎨 [updateDebugInfo] 发现 ${materials.length} 个材质`);
    console.log(`📁 [updateDebugInfo] 纹理管理器中有 ${textures.length} 个纹理: [${textures.join(', ')}]`);
    
    materials.forEach((material: any, index: number) => {
      if (material.texture) {
        console.log(`🔍 [updateDebugInfo] 材质 ${index} 需要纹理: "${material.texture}"`);
        const matchResult = textureManager.getTextureUrl(material.texture);
        textureMatches[material.texture] = matchResult;
        console.log(`  ${matchResult ? '✅' : '❌'} 匹配结果: ${matchResult || '未找到'}`);
      } else {
        console.log(`🎨 [updateDebugInfo] 材质 ${index} 不需要纹理（纯色）`);
      }
    });

    const debugData = {
      materials,
      textures,
      textureMatches
    };
    
    console.log(`📊 [updateDebugInfo] 最终调试数据:`, debugData);
    setDebugInfo(debugData);
  }, [textureManager]);

  // 处理纹理文件变化
  useEffect(() => {
    const textureFiles = localFileData?.textureFiles;
    console.log(`🔍 [MMDViewer] 纹理文件变化检测:`, {
      hasLocalFileData: !!localFileData,
      hasTextureFiles: !!textureFiles,
      textureFilesSize: textureFiles?.size || 0,
      parseResultExists: !!parseResult
    });
    
    if (textureFiles && textureFiles.size > 0) {
      console.log(`📂 [MMDViewer] 处理 ${textureFiles.size} 个纹理文件:`);
      Array.from(textureFiles.entries()).forEach(([key, file]) => {
        console.log(`  - 键: "${key}", 文件名: "${file.name}", 大小: ${(file.size/1024).toFixed(1)}KB`);
      });
      
      // 清理之前的纹理
      textureManager.clear();
      console.log(`🧹 [MMDViewer] 清理了纹理管理器`);
      
      // 添加新的纹理文件
      let addedCount = 0;
      textureFiles.forEach((file: File, key: string) => {
        console.log(`➕ [MMDViewer] 添加纹理到管理器: "${file.name}"`);
        textureManager.addTexture(file);
        addedCount++;
      });
      
      console.log(`✅ [MMDViewer] 已添加 ${addedCount} 个纹理文件到管理器`);
      console.log(`📋 [MMDViewer] 管理器中的纹理列表:`, textureManager.listTextures());

      // 如果有解析结果，重新构建模型
      if (parseResult && sceneRef.current) {
        console.log(`🔄 [MMDViewer] 重新构建模型以应用新纹理`);
        rebuildModelWithTextures();
      } else {
        console.log(`⏳ [MMDViewer] 等待模型解析完成后应用纹理`);
      }
    } else {
      console.log(`📭 [MMDViewer] 没有纹理文件需要处理`);
    }
  }, [localFileData?.textureFiles, parseResult]);

  // 重新构建模型以应用纹理
  const rebuildModelWithTextures = useCallback(async () => {
    if (!parseResult || !sceneRef.current) return;

    try {
      // 移除当前模型
      const modelsToRemove: THREE.Object3D[] = [];
      sceneRef.current.scene.traverse((child) => {
        if (child.userData.isModel) {
          modelsToRemove.push(child);
        }
      });
      modelsToRemove.forEach(model => {
        sceneRef.current!.scene.remove(model);
        disposeObject(model);
      });

      // 重新构建模型
      const { MMDModelBuilder } = await import('../../utils/mmdModelBuilder');
      const group = MMDModelBuilder.buildMesh(parseResult, textureManager);
      
      group.userData.isModel = true;
      group.userData.modelPath = parseResult.metadata?.modelName || 'Unknown';
      group.userData.modelType = 'PMX';
      group.userData.mmdModel = parseResult;

      // 添加到场景
      sceneRef.current.scene.add(group);
      updateDebugInfo(parseResult);

      console.log('模型重构完成，纹理已应用');
    } catch (error) {
      console.error('重构模型失败:', error);
    }
  }, [parseResult, textureManager, updateDebugInfo]);

  // 组件初始化 - 创建Three.js场景
  useEffect(() => {
    initScene();
    
    // 清理函数
    return () => {
      stopRenderLoop();
      if (sceneRef.current?.renderer) {
        sceneRef.current.renderer.dispose();
      }
    };
  }, [initScene, stopRenderLoop]);

  // 处理本地文件数据变化
  useEffect(() => {
    if (localFileData && localFileData.arrayBuffer) {
      console.log('处理本地文件数据:', localFileData.name);
      loadModelFromBuffer(localFileData.arrayBuffer, localFileData.name);
    }
  }, [localFileData, loadModelFromBuffer]);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResizeEvent = () => handleResize();
    window.addEventListener('resize', handleResizeEvent);
    return () => window.removeEventListener('resize', handleResizeEvent);
  }, [handleResize]);

  // 进度报告
  useEffect(() => {
    if (typeof onProgress === 'function') {
      onProgress(progress);
    }
  }, [progress, onProgress]);

  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* 调试面板 */}
      {debugInfo.materials.length > 0 && (
        <div className="bg-gray-100 p-4 mb-4 rounded-lg text-sm space-y-4">
          <h3 className="font-bold mb-2">🔍 纹理调试信息</h3>
          
          {/* 模型需要的纹理文件清单 */}
          <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
            <strong className="text-blue-800">📄 模型需要的纹理文件清单:</strong>
            {(() => {
              const requiredTextures = debugInfo.materials
                .map(material => material.texture)
                .filter(texture => texture && texture.trim() !== '');
              
              if (requiredTextures.length === 0) {
                return <p className="text-gray-600 mt-2">✨ 此模型不需要任何纹理文件（纯色材质）</p>;
              }
              
              return (
                <div className="mt-2">
                  <p className="text-blue-700 mb-2">请准备以下 {requiredTextures.length} 个纹理文件：</p>
                  <ul className="list-decimal list-inside ml-4 space-y-1">
                    {requiredTextures.map((texture, i) => {
                      const isMatched = debugInfo.textureMatches[texture];
                      const fileName = texture.split(/[/\\]/).pop() || texture;
                      return (
                        <li key={i} className="flex items-center">
                          <span className="font-mono bg-white px-2 py-1 rounded shadow-sm">
                            {fileName}
                          </span>
                          {texture !== fileName && (
                            <span className="text-gray-500 text-xs ml-2">
                              (完整路径: {texture})
                            </span>
                          )}
                          {isMatched ? (
                            <span className="text-green-600 ml-2 font-semibold">✅ 已上传</span>
                          ) : (
                            <span className="text-red-600 ml-2 font-semibold">❌ 缺失</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })()}
          </div>

          {/* 已上传纹理文件列表 */}
          <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
            <strong className="text-green-800">📋 已上传纹理文件 ({debugInfo.textures.length}):</strong>
            {debugInfo.textures.length === 0 ? (
              <p className="text-gray-600 mt-2">尚未上传任何纹理文件</p>
            ) : (
              <ul className="list-disc list-inside ml-4 mt-2">
                {debugInfo.textures.map((texture, i) => (
                  <li key={i} className="text-green-700 font-mono">{texture}</li>
                ))}
              </ul>
            )}
          </div>

          {/* 材质详细信息 */}
          <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
            <strong className="text-purple-800">🎨 材质详细信息 ({debugInfo.materials.length}):</strong>
            <ul className="mt-2 space-y-2">
              {debugInfo.materials.map((material, i) => (
                <li key={i} className="bg-white p-2 rounded shadow-sm border">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-purple-600 font-semibold">材质_{i}</span>
                    {material.texture ? (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-mono text-xs bg-blue-100 px-2 py-1 rounded">
                          {material.texture}
                        </span>
                        {debugInfo.textureMatches[material.texture] ? (
                          <span className="text-green-600 text-xs font-semibold">✅ 匹配</span>
                        ) : (
                          <span className="text-red-600 text-xs font-semibold">❌ 缺失</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">纯色材质</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* 匹配算法说明 */}
          {Object.keys(debugInfo.textureMatches).length > 0 && (
            <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
              <strong className="text-yellow-800">🔗 智能匹配算法:</strong>
              <div className="mt-2 text-xs text-yellow-700">
                <p>• <strong>精确匹配</strong>：文件名完全相同</p>
                <p>• <strong>大小写不敏感</strong>：Face.PNG ↔ face.png</p>
                <p>• <strong>路径忽略</strong>：textures/face.png ↔ face.png</p>
                <p>• <strong>格式宽容</strong>：face.jpg ↔ face.png（相同基名）</p>
              </div>
              
              <div className="mt-3">
                <strong className="text-yellow-800">匹配结果详情:</strong>
                <ul className="mt-1 space-y-1">
                  {Object.entries(debugInfo.textureMatches).map(([requested, matched]) => (
                    <li key={requested} className={`text-xs ${matched ? "text-green-700" : "text-red-700"}`}>
                      需要: <span className="font-mono">{requested}</span> → 
                      {matched ? " ✅ 找到匹配文件" : " ❌ 未找到匹配文件"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 现有的内容 */}
      <div 
        ref={mountRef}
        className={`flex-1 w-full h-full relative bg-black rounded-lg overflow-hidden shadow-lg ${className}`} 
        style={containerStyle}
      >
        <canvas 
          ref={canvasRef}
          className="block w-full h-full outline-none cursor-grab active:cursor-grabbing"
        />
        
        {/* 加载状态 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="flex flex-col items-center gap-4 text-white text-center">
              <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              <div className="text-sm font-medium">
                加载中... {Math.round(progress)}%
              </div>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
            <div className="flex flex-col items-center gap-3 text-white text-center max-w-xs p-5">
              <div className="text-5xl opacity-80">⚠️</div>
              <div className="text-base font-medium leading-relaxed">{error}</div>
            </div>
          </div>
        )}
        
        {/* 控制提示 */}
        {controls && !isLoading && !error && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-md text-xs pointer-events-none opacity-80 hover:opacity-100 transition-opacity duration-300 z-5">
            <div className="whitespace-nowrap">
              左键旋转 | 滚轮缩放 | 右键平移
            </div>
          </div>
        )}
        
        {/* 模型信息显示 */}
        {!isLoading && !error && sceneRef.current && (
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-md text-xs pointer-events-none opacity-80 z-5">
            {(() => {
              // 查找已加载的模型
              let modelObject: any = null;
              sceneRef.current.scene.traverse((child) => {
                if (child.userData.isModel) {
                  modelObject = child;
                }
              });

              if (!modelObject) {
                return <div>无模型</div>;
              }

              const isMMD = modelObject.userData.mmdModel;
              if (isMMD) {
                const isAnimation = modelObject.userData.isAnimation;
                if (isAnimation) {
                  // VMD动画文件信息显示
                  return (
                    <div className="space-y-1">
                      <div className="text-blue-300">🎬 VMD动画已加载</div>
                      <div>{modelObject.userData.mmdModel.header?.name || '未命名动画'}</div>
                      <div>{modelObject.userData.mmdModel.bone?.length || 0} 骨骼关键帧</div>
                      <div>{modelObject.userData.mmdModel.morph?.length || 0} 表情关键帧</div>
                      <div>{modelObject.userData.mmdModel.camera?.length || 0} 相机关键帧</div>
                    </div>
                  );
                } else {
                  // PMD/PMX模型文件信息显示
                  return (
                    <div className="space-y-1">
                      <div className="text-green-300">✅ MMD模型已加载</div>
                      <div>{modelObject.userData.mmdModel.metadata?.modelName || '未命名模型'}</div>
                      <div>{modelObject.userData.mmdModel.vertices?.length || 0} 顶点</div>
                    </div>
                  );
                }
              } else {
                return <div className="text-yellow-300">📦 演示模型</div>;
              }
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

export default MMDViewer; 