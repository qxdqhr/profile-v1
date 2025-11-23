'use client'

import { useState } from 'react'
import type { FileMetadata } from 'sa2kit/universalFile'

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

  // 处理文件选择
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
    handleFileSelect(e.dataTransfer.files)
  }

  // 复制 URL 到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('URL 已复制到剪贴板')
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
        </div>

        {/* 上传区域 */}
        <div className="mb-8 rounded-xl bg-white/10 backdrop-blur-md p-6 border border-white/20">
          <h2 className="mb-4 text-2xl font-bold text-white">📤 上传文件</h2>
          
          {/* 文件上传区 */}
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
              type="file"
              multiple
              webkitdirectory=""
              directory=""
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
        </div>

        {/* 已上传文件列表 */}
        {uploadedFiles.length > 0 && (
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

        {/* 使用说明 */}
        <div className="mt-8 rounded-xl bg-white/5 backdrop-blur-md p-6 border border-white/10">
          <h2 className="mb-4 text-xl font-bold text-white">📖 使用说明</h2>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex gap-2">
              <span className="text-blue-400">1.</span>
              <span>支持拖拽上传或点击选择文件/文件夹</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-400">2.</span>
              <span>支持的文件类型：.pmx, .pmd (模型), .vmd (动作), .wav/.mp3 (音频), .jpg/.png (图片)</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-400">3.</span>
              <span>单个文件最大 500MB，可同时上传多个文件</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-400">4.</span>
              <div className="flex-1">
                <div className="font-semibold text-yellow-300 mb-1">⚠️ 上传 MMD 模型的正确方式：</div>
                <div className="ml-4 space-y-1 text-xs text-gray-400">
                  <div>• 点击上传区域，选择<strong>整个模型文件夹</strong>（不是单个 .pmx 文件）</div>
                  <div>• 确保文件夹包含所有贴图文件（.png, .jpg, .bmp, .tga, .spa, .sph 等）</div>
                  <div>• 保持文件夹的原始结构，这样模型才能正确找到贴图</div>
                  <div>• 例如：选择 "miku" 文件夹，而不是只选择 "miku.pmx"</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-400">5.</span>
              <span>上传成功后，复制存储路径用于 MMD 播放器配置</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-400">6.</span>
              <span>CDN URL 提供全球加速，推荐在生产环境使用</span>
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

