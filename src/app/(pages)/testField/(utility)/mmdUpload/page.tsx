'use client'

import { useState, useEffect } from 'react'
import { FileUploader } from 'sa2kit/universalFile'
import type { FileMetadata } from 'sa2kit/universalFile'
import { createUniversalFileServiceWithConfigManager } from '@/services/universalFile'
import type { UniversalFileService } from '@/services/universalFile'

export default function MMDUploadPage() {
  const [fileService, setFileService] = useState<UniversalFileService | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([])
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  // 初始化文件服务
  useEffect(() => {
    const initService = async () => {
      try {
        console.log('🚀 初始化文件服务...')
        const service = await createUniversalFileServiceWithConfigManager()
        setFileService(service)
        console.log('✅ 文件服务初始化成功')
      } catch (error) {
        console.error('❌ 文件服务初始化失败:', error)
        setInitError(error instanceof Error ? error.message : '初始化失败')
      } finally {
        setIsInitializing(false)
      }
    }

    initService()
  }, [])

  // 处理上传成功
  const handleUploadSuccess = (files: FileMetadata[]) => {
    console.log('✅ 文件上传成功:', files)
    setUploadedFiles(prev => [...prev, ...files])
  }

  // 处理上传失败
  const handleUploadError = (error: string) => {
    console.error('❌ 文件上传失败:', error)
    alert(`上传失败: ${error}`)
  }

  // 复制 URL 到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('URL 已复制到剪贴板')
  }

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="mb-4 text-2xl">⏳ 正在初始化文件服务...</div>
          <div className="text-gray-400">请稍候</div>
        </div>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="max-w-2xl rounded-lg bg-red-900/20 border border-red-500 p-8 text-center">
          <div className="mb-4 text-2xl">❌ 初始化失败</div>
          <div className="text-red-400">{initError}</div>
          <div className="mt-6 text-sm text-gray-400">
            请检查 OSS 配置是否正确（在配置管理页面或环境变量中）
          </div>
        </div>
      </div>
    )
  }

  if (!fileService) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-2xl">⚠️ 文件服务未初始化</div>
      </div>
    )
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
          <FileUploader
            fileService={fileService}
            moduleId="mmd"
            businessId="resources"
            acceptedTypes={[
              // MMD 模型
              'application/octet-stream', // .pmx, .pmd
              // VMD 动作文件
              'application/x-vmd',
              // 音频
              'audio/wav',
              'audio/mp3',
              'audio/mpeg',
              'audio/ogg',
              // 图片（背景、贴图）
              'image/jpeg',
              'image/png',
              'image/webp',
              // 视频
              'video/mp4',
              'video/webm',
            ]}
            maxFileSize={500} // 500MB
            maxFiles={20}
            multiple={true}
            enableProcessing={false}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            mode="detailed"
            className="w-full"
          />
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
                          <span className="text-gray-400">存储:</span> {file.storageType}
                        </div>
                        <div>
                          <span className="text-gray-400">状态:</span>{' '}
                          <span className="text-green-400">✓ 已上传</span>
                        </div>
                      </div>

                      {/* URL 列表 */}
                      <div className="space-y-2">
                        {/* 原始 URL */}
                        <div className="rounded bg-black/30 p-3">
                          <div className="mb-1 text-xs text-gray-400">原始 URL:</div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 overflow-x-auto text-xs text-green-300">
                              {file.url}
                            </code>
                            <button
                              onClick={() => copyToClipboard(file.url)}
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
              <span>支持拖拽上传或点击选择文件</span>
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
              <span>上传成功后，复制 CDN URL 用于 MMD 播放器配置</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-400">5.</span>
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

