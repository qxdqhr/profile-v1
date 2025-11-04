'use client'

import React, { useState, useRef, useEffect } from 'react'
import type { RecordingState, VoiceEffectType } from '../types'

/**
 * 语音录制器组件的属性接口
 */
interface VoiceRecorderProps {
  /** 当前录音状态 */
  recordingState: RecordingState
  /** 当前选中的变声效果 */
  currentVoiceEffect: VoiceEffectType
  /** 录音状态变化回调 */
  onRecordingStateChange: (state: RecordingState) => void
  /** 变声效果变化回调 */
  onVoiceEffectChange: (effect: VoiceEffectType) => void
  /** 是否启用录音功能 */
  enabled: boolean
}

/**
 * ========================================
 * 语音录制器组件
 * ========================================
 * 
 * 功能说明：
 * - 支持按住录音，松开停止
 * - 提供多种变声效果选择
 * - 实时音量监测和可视化
 * - 最长录音10秒
 * - 使用 Web Audio API 和 MediaRecorder
 * 
 * 变声效果：
 * - 正常、尖声、低沉
 * - 机器人、回声、快速、慢速
 * 
 * @component
 */
export default function VoiceRecorder({
  recordingState,
  currentVoiceEffect,
  onRecordingStateChange,
  onVoiceEffectChange,
  enabled,
}: VoiceRecorderProps) {
  const [showEffects, setShowEffects] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // 变声效果列表
  const voiceEffects: Array<{ type: VoiceEffectType; label: string; icon: string }> = [
    { type: 'normal', label: '正常', icon: '🎤' },
    { type: 'high_pitch', label: '尖声', icon: '🐭' },
    { type: 'low_pitch', label: '低沉', icon: '🐻' },
    { type: 'robot', label: '机器人', icon: '🤖' },
    { type: 'echo', label: '回声', icon: '🔊' },
    { type: 'fast', label: '快速', icon: '⚡' },
    { type: 'slow', label: '慢速', icon: '🐌' },
  ]

  // 开始录音
  const startRecording = async () => {
    if (!enabled) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // 创建音频上下文和分析器
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      // 创建录音器
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        console.log('录音完成', audioBlob)
        onRecordingStateChange('ready')
        
        // 清理
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      onRecordingStateChange('recording')
      setRecordingTime(0)

      // 开始音量监测
      monitorAudioLevel()
    } catch (error) {
      console.error('录音失败:', error)
      alert('无法访问麦克风，请检查权限设置')
    }
  }

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }

  // 监测音量
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const update = () => {
      if (recordingState !== 'recording') return
      
      analyserRef.current!.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(average / 255)
      
      animationFrameRef.current = requestAnimationFrame(update)
    }
    
    update()
  }

  // 录音计时器
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 10) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } else {
      setRecordingTime(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [recordingState])

  // 清理
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-end gap-2">
      {/* 变声效果选择器 */}
      {showEffects && (
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-3 mb-2">
          <div className="text-xs font-medium text-gray-700 mb-2">选择变声效果</div>
          <div className="grid grid-cols-2 gap-2">
            {voiceEffects.map(effect => (
              <button
                key={effect.type}
                onClick={() => {
                  onVoiceEffectChange(effect.type)
                  setShowEffects(false)
                }}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                  currentVoiceEffect === effect.type
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{effect.icon}</span>
                <span className="text-xs">{effect.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 录音控制 */}
      <div className="flex items-center gap-2">
        {/* 变声效果按钮 */}
        <button
          onClick={() => setShowEffects(!showEffects)}
          className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center"
          title="变声效果"
        >
          <span className="text-xl">
            {voiceEffects.find(e => e.type === currentVoiceEffect)?.icon || '🎤'}
          </span>
        </button>

        {/* 录音按钮 */}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          disabled={!enabled}
          className={`relative w-16 h-16 rounded-full shadow-xl transition-all flex items-center justify-center ${
            recordingState === 'recording'
              ? 'bg-red-500 scale-110 animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600 hover:scale-110'
          } ${!enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="按住录音"
        >
          <span className="text-2xl text-white">
            {recordingState === 'recording' ? '🔴' : '🎤'}
          </span>

          {/* 音量指示器 */}
          {recordingState === 'recording' && (
            <div className="absolute inset-0 rounded-full border-4 border-white/50"
              style={{
                transform: `scale(${1 + audioLevel * 0.3})`,
                transition: 'transform 0.1s',
              }}
            />
          )}
        </button>
      </div>

      {/* 录音时长显示 */}
      {recordingState === 'recording' && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
          录音中 {recordingTime}s / 10s
        </div>
      )}

      {/* 使用提示 */}
      {recordingState === 'idle' && (
        <div className="bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap">
          按住按钮录音
        </div>
      )}
    </div>
  )
}

