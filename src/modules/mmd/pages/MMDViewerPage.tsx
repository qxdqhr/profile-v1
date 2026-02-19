'use client';

import React, { useState } from 'react';
import { MMDViewer } from '../components/MMDViewer';
import MMDSettingsModal from '../components/MMDSettingsModal';
import { Modal } from../components';
import { FileText } from 'lucide-react';

// 本地文件数据接口
interface LocalFileData {
  file: File;
  arrayBuffer: ArrayBuffer;
  name: string;
  textureFiles?: Map<string, File>;
}

// 纹理文件状态
interface TextureFileState {
  files: Map<string, File>;
  count: number;
}

/**
 * MMD查看器页面组件
 */
export function MMDViewerPage() {
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(undefined);
  const [selectedAnimationId, setSelectedAnimationId] = useState<string | undefined>();
  const [selectedAudioId, setSelectedAudioId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 本地文件数据状态
  const [localFileData, setLocalFileData] = useState<LocalFileData | null>(null);
  
  // 纹理文件状态
  const [textureFiles, setTextureFiles] = useState<TextureFileState>({
    files: new Map(),
    count: 0
  });
  
  // 弹窗状态
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // 控制设置
  const [controlSettings, setControlSettings] = useState({
    enableOrbitControls: true,
    autoPlayAnimation: false,
    showGrid: false,
  });

  const handleModelLoad = (model: any) => {
    console.log('Model loaded:', model);
    setError(null);
  };

  const handleError = (err: Error) => {
    console.error('Error loading model:', err);
    setError(err.message);
  };

  const handleProgress = (progress: number) => {
    console.log('Loading progress:', progress);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  const handleAnimationSelect = (animationId?: string) => {
    setSelectedAnimationId(animationId);
  };

  const handleControlSettingsChange = (newSettings: typeof controlSettings) => {
    setControlSettings(newSettings);
  };

  // 处理纹理文件添加
  const handleTextureFilesAdd = (files: File[]) => {
    const newTextureFiles = new Map(textureFiles.files);
    
    files.forEach(file => {
      const fileName = file.name; // 🔧 修复：保持原始文件名，不转小写
      // 只接受图片文件
      if (file.type.startsWith('image/') || /\.(png|jpg|jpeg|bmp|tga|dds)$/i.test(fileName)) {
        newTextureFiles.set(fileName, file);
        console.log(`📁 [MMDViewerPage] 添加纹理文件: "${file.name}" (大小: ${(file.size/1024).toFixed(1)}KB)`);
      } else {
        console.warn(`⚠️ [MMDViewerPage] 忽略非图片文件: ${file.name}`);
      }
    });

    console.log(`🗂️ [MMDViewerPage] 纹理文件Map更新，当前包含 ${newTextureFiles.size} 个文件:`);
    newTextureFiles.forEach((file, key) => {
      console.log(`  - 键: "${key}", 文件: "${file.name}"`);
    });

    setTextureFiles({
      files: newTextureFiles,
      count: newTextureFiles.size
    });

    // 如果已经有模型数据，重新构建模型
    if (localFileData) {
      const updatedData: LocalFileData = {
        ...localFileData,
        textureFiles: newTextureFiles
      };
      console.log(`🔄 [MMDViewerPage] 更新本地文件数据，纹理文件数量: ${newTextureFiles.size}`);
      setLocalFileData(updatedData);
    }
  };

  // 清理纹理文件
  const handleClearTextures = () => {
    setTextureFiles({
      files: new Map(),
      count: 0
    });
    
    if (localFileData) {
      const updatedData: LocalFileData = {
        ...localFileData,
        textureFiles: undefined
      };
      setLocalFileData(updatedData);
    }
  };

  // 处理文件导入成功
  const handleImportSuccess = async (result: any) => {
    console.log('文件选择成功:', result);
    
    // 注释掉原有的服务器依赖逻辑
    // if (result.id) {
    //   setSelectedModelId(result.id);
    //   setIsImportModalOpen(false);
    //   setError(null); // 清除任何现有错误
    //   
    //   // 显示成功消息
    //   console.log(`✅ 模型 "${result.name}" 导入成功！文件大小: ${(result.fileSize / 1024 / 1024).toFixed(1)}MB`);
    // }

    // 新的本地文件处理逻辑
    if (result.file && result.file instanceof File) {
      try {
        setIsLoading(true);
        setError(null);
        
        // 读取文件为ArrayBuffer
        const arrayBuffer = await result.file.arrayBuffer();
        
        console.log(`🎯 开始准备解析本地文件: ${result.file.name}`);
        console.log(`📁 文件大小: ${(result.file.size / 1024 / 1024).toFixed(1)}MB`);
        
        // 设置本地文件数据，让MMDViewer组件接收并处理
        const fileData: LocalFileData = {
          file: result.file,
          arrayBuffer: arrayBuffer,
          name: result.file.name,
          textureFiles: textureFiles.files.size > 0 ? textureFiles.files : undefined
        };
        
        console.log(`📦 [MMDViewerPage] 准备传递给MMDViewer的数据:`, {
          fileName: fileData.name,
          arrayBufferSize: fileData.arrayBuffer.byteLength,
          hasTextureFiles: !!fileData.textureFiles,
          textureFilesCount: fileData.textureFiles?.size || 0
        });
        
        if (fileData.textureFiles) {
          console.log(`🗂️ [MMDViewerPage] 传递的纹理文件详情:`);
          fileData.textureFiles.forEach((file, key) => {
            console.log(`  - "${key}" -> "${file.name}"`);
          });
        }
        
        setLocalFileData(fileData);
        setSelectedModelId(`local:${result.file.name}`);
        setIsImportModalOpen(false);
        setIsLoading(false);
        
        console.log(`✅ 模型 "${result.file.name}" 已准备解析！`);
        
      } catch (error) {
        console.error('本地文件处理失败:', error);
        setError(`文件处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
        setIsLoading(false);
      }
    } else {
      setError('无效的文件数据');
    }
  };

  // 处理文件导入错误
  const handleImportError = (error: string) => {
    console.error('模型导入失败:', error);
    setError(error);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-800 overflow-hidden">
      {/* 页面标题和工具栏 - 紧凑布局 */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-gray-800">MMD模型查看器</h1>
            <p className="text-xs text-gray-600">
              导入和预览MikuMikuDance(MMD)模型
            </p>
          </div>
          
          {/* 工具栏按钮 */}
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              onClick={() => setIsImportModalOpen(true)}
              title="导入模型"
            >
              <span>📁</span>
              <span className="hidden sm:inline">导入模型</span>
            </button>

            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              onClick={() => setIsSettingsModalOpen(true)}
              title="打开设置"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">设置</span>
            </button>

            <button 
              className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-all hover:-translate-y-0.5 text-sm flex items-center gap-1" 
              title="全屏查看"
            >
              🔍 <span className="hidden sm:inline text-xs">全屏</span>
            </button>
            <button 
              className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-all hover:-translate-y-0.5 text-sm flex items-center gap-1" 
              title="截图保存"
            >
              📷 <span className="hidden sm:inline text-xs">截图</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主查看区域 - 占满剩余空间 */}
      {/* flex items-center justify-center 该元素的子元素会居中显示*/}
      <div className="flex-1 bg-gray-900 overflow-hidden flex items-center justify-center relative">
        <MMDViewer
          modelId={selectedModelId}
          animationId={selectedAnimationId}
          audioId={selectedAudioId}
          width="90%"
          height="100%"
          controls={controlSettings.enableOrbitControls}
          autoPlay={controlSettings.autoPlayAnimation}
          onLoad={handleModelLoad}
          onError={handleError}
          onProgress={handleProgress}
          className="h-full"
          localFileData={localFileData}
        />

                 {/* 无模型时的欢迎界面 */}
         {!selectedModelId && (
           <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm">
             <div className="text-center text-white max-w-md mx-auto p-8">
               <div className="text-8xl mb-6 opacity-80">🎭</div>
               <h2 className="text-3xl font-bold mb-4">欢迎使用MMD查看器</h2>
               <p className="text-gray-300 mb-8 leading-relaxed">
                 这是一个基于Three.js的3D模型查看器，专门用于预览和播放MikuMikuDance(MMD)模型和动画
               </p>
               
               <div className="space-y-4">
                 <button
                   onClick={() => setIsImportModalOpen(true)}
                   className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
                 >
                   <span className="text-xl">📁</span>
                   <span>导入你的第一个模型</span>
                 </button>
                 
                 <div className="text-center">
                   <span className="text-gray-400 text-sm">或者</span>
                 </div>
                 
                 <button
                   onClick={() => setSelectedModelId('demo')}
                   className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                 >
                   查看演示模型
                 </button>
               </div>
               
               <div className="mt-8 text-xs text-gray-400">
                 <p>支持格式：PMD、PMX模型 + VMD动画</p>
               </div>
             </div>
           </div>
         )}

         {/* 有模型时的浮动快速操作按钮 */}
         {selectedModelId && (
           <div className="absolute bottom-6 right-6 flex flex-col gap-3">
             <button
               onClick={() => setIsImportModalOpen(true)}
               className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-xl"
               title="导入新模型"
             >
               📁
             </button>
             <button
               onClick={() => setSelectedModelId(undefined)}
               className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-xl"
               title="清除当前模型"
             >
               🗑️
             </button>
           </div>
         )}
      </div>
      
      {/* 设置弹窗 */}
      <MMDSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        selectedModelId={selectedModelId}
        selectedAnimationId={selectedAnimationId}
        onModelSelect={handleModelSelect}
        onAnimationSelect={handleAnimationSelect}
        controlSettings={controlSettings}
        onControlSettingsChange={handleControlSettingsChange}
      />

      {/* 导入模型弹窗 */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="导入MMD模型"
        width={600}
        height={500}
        maskClosable={true}
        showCloseButton={true}
      >
        <div className="p-6">
          <div className="mb-6 text-center">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">导入3D模型文件</h3>
            <p className="text-sm text-gray-600">
              支持PMD和PMX格式的MMD模型文件，导入后将自动加载到查看器中
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-gray-500 mb-4">
                <FileText className="w-12 h-12 mx-auto mb-2" />
                <p>文件上传功能正在开发中</p>
                <p className="text-sm">请使用预设的模型文件</p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                关闭
              </button>
            </div>

            {/* 纹理文件上传区域 */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                纹理文件 (可选)
              </h4>
              <p className="text-xs text-gray-500 mb-3">
                为PMX模型添加纹理图片文件，支持 PNG、JPG、BMP 格式
              </p>
              
              <div className="space-y-3">
                {/* 纹理文件拖拽上传 */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.png,.jpg,.jpeg,.bmp,.tga,.dds"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        handleTextureFilesAdd(files);
                      }
                    }}
                    className="hidden"
                    id="texture-upload"
                  />
                  <label
                    htmlFor="texture-upload"
                    className="cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    <div className="text-2xl mb-2">🖼️</div>
                    <div className="text-sm font-medium">点击选择或拖拽纹理文件</div>
                    <div className="text-xs mt-1">支持 PNG, JPG, BMP 等格式</div>
                  </label>
                </div>

                {/* 纹理文件列表 */}
                {textureFiles.count > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        已选择 {textureFiles.count} 个纹理文件
                      </span>
                      <button
                        onClick={handleClearTextures}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        清除全部
                      </button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {Array.from(textureFiles.files.entries()).map(([fileName, file]) => (
                        <div key={fileName} className="flex justify-between items-center text-xs text-gray-600">
                          <span className="truncate flex-1">{file.name}</span>
                          <span className="ml-2 text-gray-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-red-500 text-xl">⚠️</div>
                <div className="flex-1">
                  <h4 className="text-red-800 font-semibold mb-1">导入失败</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 text-xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MMDViewerPage; 