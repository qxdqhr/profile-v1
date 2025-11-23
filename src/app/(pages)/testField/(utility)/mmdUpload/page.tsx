'use client'

import { useState, useRef } from 'react'
import type { FileMetadata } from 'sa2kit/universalFile'

type UploadMode = 'zip' | 'folder'

interface ZipUploadResult {
  success: boolean
  modelName: string
  basePath: string
  ossBaseUrl: string
  files: Array<{
    originalPath: string
    storagePath: string
    cdnUrl: string
    type: string
    size: number
  }>
  summary: {
    total: number
    uploaded: number
    failed: number
  }
  resources: {
    modelPath: string | null
    motionPaths: string[]
    audioPaths: string[]
  }
  usage: {
    modelPath: string
    example: string
  }
}

interface OSSFile {
  name: string
  url: string
  size: number
  lastModified: Date
  type: string
}

interface MMDFolder {
  name: string
  path: string
  files: OSSFile[]
  modelFiles: OSSFile[]
  motionFiles: OSSFile[]
  audioFiles: OSSFile[]
  textureFiles: OSSFile[]
  totalSize: number
  fileCount: number
}

interface OSSListResult {
  success: boolean
  folders: MMDFolder[]
  totalFiles: number
  totalSize: number
  ossBaseUrl: string
  summary: {
    totalFolders: number
    totalFiles: number
    totalSize: number
    totalSizeFormatted: string
  }
}

export default function MMDUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<Array<{
    id: string
    name: string
    progress: number
    status: 'uploading' | 'success' | 'error'
    error?: string
  }>>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadMode, setUploadMode] = useState<UploadMode>('zip')
  const [zipResult, setZipResult] = useState<ZipUploadResult | null>(null)
  const [isUploadingZip, setIsUploadingZip] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)
  
  // OSS 文件列表相关状态
  const [ossFiles, setOssFiles] = useState<OSSListResult | null>(null)
  const [isLoadingOss, setIsLoadingOss] = useState(false)
  const [showOssFiles, setShowOssFiles] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<MMDFolder | null>(null)

  // 处理压缩包上传
  const handleZipUpload = async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      alert('请选择 .zip 格式的压缩包')
      return
    }

    setIsUploadingZip(true)
    setZipResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // 可选：自定义模型名称
      const modelName = prompt('请输入模型名称（留空则使用原始名称）：')
      if (modelName) {
        formData.append('modelName', modelName)
      }

      console.log('📦 开始上传压缩包:', file.name)

      const response = await fetch('/api/upload-mmd-zip', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '上传失败')
      }

      const result: ZipUploadResult = await response.json()
      console.log('✅ 压缩包上传成功:', result)
      
      setZipResult(result)
      alert(`✅ 上传成功！\n\n模型名称: ${result.modelName}\n上传文件: ${result.summary.uploaded}/${result.summary.total}\n失败: ${result.summary.failed}`)

    } catch (error) {
      console.error('❌ 压缩包上传失败:', error)
      alert(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsUploadingZip(false)
    }
  }

  // 处理文件夹上传（原有逻辑）
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    
    // 验证文件
    for (const file of fileArray) {
      if (file.size > 500 * 1024 * 1024) {
        alert(`文件 ${file.name} 超过 500MB 限制`)
        return
      }
    }

    // 开始上传
    for (const file of fileArray) {
      const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      setUploadingFiles(prev => [...prev, {
        id: fileId,
        name: file.name,
        progress: 0,
        status: 'uploading'
      }])

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('moduleId', 'mmd')
        formData.append('businessId', 'resources')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`上传失败: ${response.statusText}`)
        }

        const result = await response.json()
        
        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'success' as const, progress: 100 } : f
        ))
        
        setUploadedFiles(prev => [...prev, result.file])
        
        // 3秒后移除上传状态
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.id !== fileId))
        }, 3000)

      } catch (error) {
        console.error('上传失败:', error)
        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            status: 'error' as const, 
            error: error instanceof Error ? error.message : '上传失败' 
          } : f
        ))
      }
    }
  }

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length === 0) return

    // 检查是否是压缩包
    if (uploadMode === 'zip' && files[0].name.endsWith('.zip')) {
      handleZipUpload(files[0])
    } else if (uploadMode === 'folder') {
      handleFileSelect(files)
    } else {
      alert('请选择正确的文件类型')
    }
  }

  // 复制 URL 到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('URL 已复制到剪贴板')
  }

  // 查询 OSS 中的 MMD 文件
  const loadOssFiles = async () => {
    setIsLoadingOss(true)
    try {
      const response = await fetch('/api/list-mmd-files?prefix=mmd/')
      if (!response.ok) {
        throw new Error('查询失败')
      }
      const result: OSSListResult = await response.json()
      setOssFiles(result)
      setShowOssFiles(true)
      console.log('✅ OSS 文件列表:', result)
    } catch (error) {
      console.error('❌ 查询 OSS 文件失败:', error)
      alert(`查询失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsLoadingOss(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-8">
      <div className="mx-auto max-w-6xl">
        {/* 标题 */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">
            🎭 MMD 资源上传工具
          </h1>
          <p className="text-gray-300">
            上传 MMD 模型、动作、音频等资源到 OSS，获取 CDN 加速链接
          </p>
          
          {/* 查询 OSS 文件按钮 */}
          <div className="mt-4">
            <button
              onClick={loadOssFiles}
              disabled={isLoadingOss}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingOss ? '🔄 查询中...' : '📂 查看 OSS 已有文件'}
            </button>
          </div>
        </div>

        {/* 上传模式切换 */}
        <div className="mb-6 flex justify-center gap-4">
          <button
            onClick={() => setUploadMode('zip')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              uploadMode === 'zip'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            📦 压缩包上传（推荐）
          </button>
          <button
            onClick={() => setUploadMode('folder')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              uploadMode === 'folder'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            📁 文件夹上传
          </button>
        </div>

        {/* 上传区域 */}
        <div className="mb-8 rounded-xl bg-white/10 backdrop-blur-md p-6 border border-white/20">
          <h2 className="mb-4 text-2xl font-bold text-white">
            📤 {uploadMode === 'zip' ? '上传 MMD 压缩包' : '上传文件/文件夹'}
          </h2>
          
          {/* 压缩包上传模式 */}
          {uploadMode === 'zip' && (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => zipInputRef.current?.click()}
                className={`
                  relative rounded-lg border-2 border-dashed p-12 text-center transition-all cursor-pointer
                  ${isDragging 
                    ? 'border-purple-400 bg-purple-500/10' 
                    : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
                  }
                  ${isUploadingZip ? 'opacity-50 pointer-events-none' : ''}
                `}
              >
                <input
                  ref={zipInputRef}
                  type="file"
                  accept=".zip"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleZipUpload(file)
                  }}
                  className="hidden"
                />
                
                <div className="pointer-events-none">
                  <div className="mb-4 text-6xl">
                    {isUploadingZip ? '⏳' : '📦'}
                  </div>
                  <div className="mb-2 text-xl font-semibold text-white">
                    {isUploadingZip 
                      ? '正在处理压缩包...' 
                      : isDragging 
                        ? '松开以上传压缩包' 
                        : '拖拽 .zip 压缩包到这里或点击选择'
                    }
                  </div>
                  <div className="text-sm text-gray-400">
                    支持包含 MMD 模型、动作、音频、贴图的 .zip 压缩包
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    压缩包最大 500MB，自动解压并上传所有文件
                  </div>
                  
                  <div className="mt-6 rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-left">
                    <div className="mb-2 text-sm font-semibold text-green-300">
                      ✨ 压缩包上传优势：
                    </div>
                    <div className="text-xs text-green-200/80 space-y-1">
                      <div>• <strong>自动解压</strong>：服务端自动解压并上传所有文件</div>
                      <div>• <strong>保持结构</strong>：自动保持文件夹结构和相对路径</div>
                      <div>• <strong>规范命名</strong>：自动规范化目录和文件名</div>
                      <div>• <strong>一键上传</strong>：无需手动选择文件夹，更加便捷</div>
                      <div>• <strong>完整性保证</strong>：确保所有贴图和资源一并上传</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-blue-500/10 border border-blue-500/30 p-4 text-left">
                    <div className="mb-2 text-sm font-semibold text-blue-300">
                      📋 使用步骤：
                    </div>
                    <div className="text-xs text-blue-200/80 space-y-1">
                      <div>1. 将 MMD 模型文件夹压缩为 .zip 格式</div>
                      <div>2. 拖拽或点击上传压缩包</div>
                      <div>3. 输入模型名称（可选，留空使用原始名称）</div>
                      <div>4. 等待自动解压和上传完成</div>
                      <div>5. 复制生成的资源路径用于播放器配置</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 压缩包上传结果 */}
              {zipResult && (
                <div className="mt-6 rounded-lg bg-green-500/10 border border-green-500/30 p-6">
                  <h3 className="mb-4 text-xl font-bold text-green-300">
                    ✅ 上传成功！
                  </h3>
                  
                  <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded bg-black/30 p-3">
                      <div className="text-gray-400 mb-1">模型名称</div>
                      <div className="text-white font-semibold">{zipResult.modelName}</div>
                    </div>
                    <div className="rounded bg-black/30 p-3">
                      <div className="text-gray-400 mb-1">上传统计</div>
                      <div className="text-white font-semibold">
                        {zipResult.summary.uploaded}/{zipResult.summary.total} 个文件
                        {zipResult.summary.failed > 0 && (
                          <span className="text-red-400 ml-2">
                            ({zipResult.summary.failed} 失败)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 资源路径 */}
                  <div className="space-y-3">
                    {zipResult.resources.modelPath && (
                      <div className="rounded bg-black/30 p-3">
                        <div className="mb-2 text-xs text-gray-400">模型路径:</div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 overflow-x-auto text-xs text-green-300">
                            {zipResult.resources.modelPath}
                          </code>
                          <button
                            onClick={() => copyToClipboard(zipResult.resources.modelPath!)}
                            className="rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600 transition-colors"
                          >
                            复制
                          </button>
                        </div>
                      </div>
                    )}

                    {zipResult.resources.motionPaths.length > 0 && (
                      <div className="rounded bg-black/30 p-3">
                        <div className="mb-2 text-xs text-gray-400">
                          动作路径 ({zipResult.resources.motionPaths.length}):
                        </div>
                        {zipResult.resources.motionPaths.map((path, idx) => (
                          <div key={idx} className="flex items-center gap-2 mb-2">
                            <code className="flex-1 overflow-x-auto text-xs text-blue-300">
                              {path}
                            </code>
                            <button
                              onClick={() => copyToClipboard(path)}
                              className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600 transition-colors"
                            >
                              复制
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {zipResult.resources.audioPaths.length > 0 && (
                      <div className="rounded bg-black/30 p-3">
                        <div className="mb-2 text-xs text-gray-400">
                          音频路径 ({zipResult.resources.audioPaths.length}):
                        </div>
                        {zipResult.resources.audioPaths.map((path, idx) => (
                          <div key={idx} className="flex items-center gap-2 mb-2">
                            <code className="flex-1 overflow-x-auto text-xs text-purple-300">
                              {path}
                            </code>
                            <button
                              onClick={() => copyToClipboard(path)}
                              className="rounded bg-purple-500 px-3 py-1 text-xs text-white hover:bg-purple-600 transition-colors"
                            >
                              复制
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 使用示例 */}
                  <div className="mt-4 rounded bg-black/30 p-4">
                    <div className="mb-2 text-xs text-gray-400">代码示例:</div>
                    <pre className="overflow-x-auto text-xs text-gray-300 whitespace-pre-wrap">
                      {zipResult.usage.example}
                    </pre>
                  </div>

                  {/* 文件列表 */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">
                      查看所有上传文件 ({zipResult.files.length})
                    </summary>
                    <div className="mt-2 max-h-64 overflow-y-auto space-y-1">
                      {zipResult.files.map((file, idx) => (
                        <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                          <span className={`
                            px-2 py-0.5 rounded text-[10px]
                            ${file.type === 'model' ? 'bg-green-500/30 text-green-300' :
                              file.type === 'texture' ? 'bg-blue-500/30 text-blue-300' :
                              file.type === 'motion' ? 'bg-purple-500/30 text-purple-300' :
                              file.type === 'audio' ? 'bg-pink-500/30 text-pink-300' :
                              'bg-gray-500/30 text-gray-300'}
                          `}>
                            {file.type}
                          </span>
                          <span className="flex-1">{file.originalPath}</span>
                          <span className="text-gray-500">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </>
          )}

          {/* 文件夹上传模式 */}
          {uploadMode === 'folder' && (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative rounded-lg border-2 border-dashed p-12 text-center transition-all
                  ${isDragging 
                    ? 'border-blue-400 bg-blue-500/10' 
                    : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  // @ts-ignore
                  webkitdirectory="true"
                  // @ts-ignore
                  directory="true"
                  accept=".pmx,.pmd,.vmd,.wav,.mp3,.ogg,.jpg,.jpeg,.png,.webp,.mp4,.webm,.bmp,.tga,.spa,.sph"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                
                <div className="pointer-events-none">
                  <div className="mb-4 text-6xl">📁</div>
                  <div className="mb-2 text-xl font-semibold text-white">
                    {isDragging ? '松开以上传文件/文件夹' : '拖拽文件/文件夹到这里或点击选择'}
                  </div>
                  <div className="text-sm text-gray-400">
                    支持 MMD 模型(.pmx, .pmd)、动作(.vmd)、音频、图片、视频
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    单个文件最大 500MB，可同时上传多个文件
                  </div>
                  <div className="mt-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 text-left">
                    <div className="mb-1 text-sm font-semibold text-yellow-300">
                      ⚠️ 重要提示：上传 MMD 模型
                    </div>
                    <div className="text-xs text-yellow-200/80 space-y-1">
                      <div>• 请上传<strong>整个模型文件夹</strong>（包含 .pmx 和所有贴图文件）</div>
                      <div>• 模型文件通常引用相对路径的贴图，缺少贴图会导致模型无法正常显示</div>
                      <div>• 点击上传按钮可以选择整个文件夹上传</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 上传进度 */}
              {uploadingFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  {uploadingFiles.map((file) => (
                    <div
                      key={file.id}
                      className="rounded-lg bg-white/5 p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{file.name}</span>
                        <span className={`text-sm ${
                          file.status === 'success' ? 'text-green-400' :
                          file.status === 'error' ? 'text-red-400' :
                          'text-blue-400'
                        }`}>
                          {file.status === 'success' ? '✓ 完成' :
                           file.status === 'error' ? '✗ 失败' :
                           `${file.progress}%`}
                        </span>
                      </div>
                      {file.status === 'uploading' && (
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                      {file.error && (
                        <div className="mt-2 text-xs text-red-400">{file.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* 已上传文件列表（文件夹模式） */}
        {uploadMode === 'folder' && uploadedFiles.length > 0 && (
          <div className="rounded-xl bg-white/10 backdrop-blur-md p-6 border border-white/20">
            <h2 className="mb-4 text-2xl font-bold text-white">
              ✅ 已上传文件 ({uploadedFiles.length})
            </h2>
            <div className="space-y-4">
              {uploadedFiles.map((file, index) => (
                <div
                  key={file.id || index}
                  className="rounded-lg bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-lg font-semibold text-white">
                          {file.originalName}
                        </span>
                        <span className="rounded bg-blue-500/30 px-2 py-0.5 text-xs text-blue-300">
                          {getFileTypeLabel(file.mimeType)}
                        </span>
                      </div>
                      
                      <div className="mb-2 grid grid-cols-2 gap-2 text-sm text-gray-300">
                        <div>
                          <span className="text-gray-400">大小:</span> {formatFileSize(file.size)}
                        </div>
                        <div>
                          <span className="text-gray-400">类型:</span> {file.mimeType}
                        </div>
                        <div>
                          <span className="text-gray-400">存储:</span> {file.storageProvider}
                        </div>
                        <div>
                          <span className="text-gray-400">状态:</span>{' '}
                          <span className="text-green-400">✓ 已上传</span>
                        </div>
                      </div>

                      {/* URL 列表 */}
                      <div className="space-y-2">
                        {/* 存储路径 */}
                        <div className="rounded bg-black/30 p-3">
                          <div className="mb-1 text-xs text-gray-400">存储路径:</div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 overflow-x-auto text-xs text-green-300">
                              {file.storagePath}
                            </code>
                            <button
                              onClick={() => copyToClipboard(file.storagePath)}
                              className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600 transition-colors"
                            >
                              复制
                            </button>
                          </div>
                        </div>

                        {/* CDN URL */}
                        {file.cdnUrl && (
                          <div className="rounded bg-black/30 p-3">
                            <div className="mb-1 text-xs text-gray-400">CDN URL (推荐):</div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 overflow-x-auto text-xs text-purple-300">
                                {file.cdnUrl}
                              </code>
                              <button
                                onClick={() => copyToClipboard(file.cdnUrl!)}
                                className="rounded bg-purple-500 px-3 py-1 text-xs text-white hover:bg-purple-600 transition-colors"
                              >
                                复制
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OSS 文件列表 */}
        {showOssFiles && ossFiles && (
          <div className="mb-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
            {/* 标题栏 */}
            <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    📂 OSS 中的 MMD 资源
                  </h2>
                  <div className="flex gap-4 text-sm text-gray-300">
                    <span>📁 {ossFiles.summary.totalFolders} 个模型</span>
                    <span>📄 {ossFiles.summary.totalFiles} 个文件</span>
                    <span>💾 {ossFiles.summary.totalSizeFormatted}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowOssFiles(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  ✕ 关闭
                </button>
              </div>
            </div>

            {/* 文件夹列表 */}
            <div className="p-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
              {ossFiles.folders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">📭</div>
                  <div className="text-lg">暂无 MMD 资源</div>
                  <div className="text-sm mt-2">上传你的第一个 MMD 模型吧！</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {ossFiles.folders.map((folder, index) => (
                    <div
                      key={folder.path}
                      className="rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all overflow-hidden"
                    >
                      {/* 文件夹头部 */}
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => setSelectedFolder(selectedFolder?.path === folder.path ? null : folder)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">
                                {selectedFolder?.path === folder.path ? '📂' : '📁'}
                              </span>
                              <div>
                                <h3 className="text-lg font-bold text-white">
                                  {folder.name}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                  {folder.path}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 text-sm">
                              {folder.modelFiles.length > 0 && (
                                <span className="text-green-400">
                                  🎭 {folder.modelFiles.length} 模型
                                </span>
                              )}
                              {folder.motionFiles.length > 0 && (
                                <span className="text-blue-400">
                                  🎬 {folder.motionFiles.length} 动作
                                </span>
                              )}
                              {folder.audioFiles.length > 0 && (
                                <span className="text-purple-400">
                                  🎵 {folder.audioFiles.length} 音频
                                </span>
                              )}
                              {folder.textureFiles.length > 0 && (
                                <span className="text-yellow-400">
                                  🖼️ {folder.textureFiles.length} 贴图
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm text-gray-400">
                              {formatFileSize(folder.totalSize)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {folder.fileCount} 个文件
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 文件夹详情（展开时显示） */}
                      {selectedFolder?.path === folder.path && (
                        <div className="border-t border-white/10 bg-black/20">
                          {/* 模型文件 */}
                          {folder.modelFiles.length > 0 && (
                            <div className="p-4 border-b border-white/5">
                              <h4 className="text-sm font-semibold text-green-300 mb-2">
                                🎭 模型文件
                              </h4>
                              <div className="space-y-2">
                                {folder.modelFiles.map((file, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs bg-white/5 rounded p-2">
                                    <span className="text-gray-300">{file.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">{formatFileSize(file.size)}</span>
                                      <button
                                        onClick={() => copyToClipboard(file.url)}
                                        className="px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
                                      >
                                        复制
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 动作文件 */}
                          {folder.motionFiles.length > 0 && (
                            <div className="p-4 border-b border-white/5">
                              <h4 className="text-sm font-semibold text-blue-300 mb-2">
                                🎬 动作文件
                              </h4>
                              <div className="space-y-2">
                                {folder.motionFiles.map((file, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs bg-white/5 rounded p-2">
                                    <span className="text-gray-300">{file.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">{formatFileSize(file.size)}</span>
                                      <button
                                        onClick={() => copyToClipboard(file.url)}
                                        className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                      >
                                        复制
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 音频文件 */}
                          {folder.audioFiles.length > 0 && (
                            <div className="p-4 border-b border-white/5">
                              <h4 className="text-sm font-semibold text-purple-300 mb-2">
                                🎵 音频文件
                              </h4>
                              <div className="space-y-2">
                                {folder.audioFiles.map((file, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs bg-white/5 rounded p-2">
                                    <span className="text-gray-300">{file.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">{formatFileSize(file.size)}</span>
                                      <button
                                        onClick={() => copyToClipboard(file.url)}
                                        className="px-2 py-1 rounded bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                                      >
                                        复制
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 贴图文件（折叠显示） */}
                          {folder.textureFiles.length > 0 && (
                            <details className="p-4">
                              <summary className="text-sm font-semibold text-yellow-300 mb-2 cursor-pointer">
                                🖼️ 贴图文件 ({folder.textureFiles.length})
                              </summary>
                              <div className="space-y-2 mt-2">
                                {folder.textureFiles.map((file, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs bg-white/5 rounded p-2">
                                    <span className="text-gray-300">{file.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">{formatFileSize(file.size)}</span>
                                      <button
                                        onClick={() => copyToClipboard(file.url)}
                                        className="px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                                      >
                                        复制
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 rounded-xl bg-white/5 backdrop-blur-md p-6 border border-white/10">
          <h2 className="mb-4 text-xl font-bold text-white">📖 使用说明</h2>
          <div className="space-y-4">
            {/* 压缩包模式说明 */}
            <div className="rounded-lg bg-purple-500/10 border border-purple-500/30 p-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">
                📦 压缩包上传模式（推荐）
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex gap-2">
                  <span className="text-purple-400">•</span>
                  <span>将 MMD 模型文件夹压缩为 .zip 格式</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-400">•</span>
                  <span>自动解压并保持文件夹结构</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-400">•</span>
                  <span>自动规范化文件名和目录名</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-400">•</span>
                  <span>一次性上传所有相关文件（模型、贴图、动作、音频）</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-400">•</span>
                  <span>上传完成后自动生成完整的资源路径和代码示例</span>
                </div>
              </div>
            </div>

            {/* 文件夹模式说明 */}
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-2">
                📁 文件夹上传模式
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>直接选择整个模型文件夹上传</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>支持拖拽上传或点击选择</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>必须包含所有贴图文件（.png, .jpg, .bmp, .tga, .spa, .sph 等）</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>保持文件夹的原始结构，确保相对路径正确</span>
                </div>
              </div>
            </div>

            {/* 通用说明 */}
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex gap-2">
                <span className="text-gray-400">📌</span>
                <span>单个文件/压缩包最大 500MB</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400">📌</span>
                <span>上传成功后，复制 CDN URL 用于 MMD 播放器配置（推荐）</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400">📌</span>
                <span>CDN URL 提供全球加速，适合生产环境使用</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 辅助函数：格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// 辅助函数：获取文件类型标签
function getFileTypeLabel(mimeType: string): string {
  if (mimeType.includes('octet-stream')) return 'MMD 模型'
  if (mimeType.includes('vmd')) return 'VMD 动作'
  if (mimeType.startsWith('audio/')) return '音频'
  if (mimeType.startsWith('image/')) return '图片'
  if (mimeType.startsWith('video/')) return '视频'
  return '其他'
}
