/**
 * 变声效果工具函数
 */

import type { VoiceEffectType, VoiceEffectConfig } from '../types'

/** 变声效果配置 */
export const VOICE_EFFECTS: Record<VoiceEffectType, VoiceEffectConfig> = {
  normal: {
    type: 'normal',
    label: '正常',
    icon: '🎤',
    params: {
      pitch: 1.0,
      playbackRate: 1.0,
    },
  },
  high_pitch: {
    type: 'high_pitch',
    label: '尖声',
    icon: '🐭',
    params: {
      pitch: 1.5,
      playbackRate: 1.2,
    },
  },
  low_pitch: {
    type: 'low_pitch',
    label: '低沉',
    icon: '🐻',
    params: {
      pitch: 0.7,
      playbackRate: 0.9,
    },
  },
  robot: {
    type: 'robot',
    label: '机器人',
    icon: '🤖',
    params: {
      pitch: 0.8,
      playbackRate: 0.95,
    },
  },
  echo: {
    type: 'echo',
    label: '回声',
    icon: '🔊',
    params: {
      pitch: 1.0,
      playbackRate: 1.0,
      echo: {
        delay: 0.3,
        decay: 0.5,
      },
    },
  },
  reverb: {
    type: 'reverb',
    label: '混响',
    icon: '🎵',
    params: {
      pitch: 1.0,
      playbackRate: 1.0,
      reverb: {
        duration: 2.0,
        decay: 0.3,
      },
    },
  },
  fast: {
    type: 'fast',
    label: '快速',
    icon: '⚡',
    params: {
      pitch: 1.2,
      playbackRate: 1.5,
    },
  },
  slow: {
    type: 'slow',
    label: '慢速',
    icon: '🐌',
    params: {
      pitch: 0.9,
      playbackRate: 0.7,
    },
  },
  alien: {
    type: 'alien',
    label: '外星人',
    icon: '👽',
    params: {
      pitch: 1.8,
      playbackRate: 1.1,
    },
  },
}

/**
 * 应用变声效果到音频
 */
export async function applyVoiceEffect(
  audioBlob: Blob,
  effectType: VoiceEffectType
): Promise<Blob> {
  const effect = VOICE_EFFECTS[effectType]
  
  // 如果是正常模式，直接返回
  if (effectType === 'normal') {
    return audioBlob
  }

  try {
    const audioContext = new AudioContext()
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    // 创建离线音频上下文
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    )

    // 创建音频源
    const source = offlineContext.createBufferSource()
    source.buffer = audioBuffer

    // 应用播放速率（影响音调和速度）
    if (effect.params.playbackRate) {
      source.playbackRate.value = effect.params.playbackRate
    }

    // 连接到目标
    source.connect(offlineContext.destination)
    source.start(0)

    // 渲染音频
    const renderedBuffer = await offlineContext.startRendering()

    // 将AudioBuffer转换为Blob
    const wavBlob = audioBufferToWav(renderedBuffer)
    
    await audioContext.close()
    return wavBlob
  } catch (error) {
    console.error('应用变声效果失败:', error)
    return audioBlob // 失败时返回原始音频
  }
}

/**
 * 将AudioBuffer转换为WAV格式的Blob
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44
  const arrayBuffer = new ArrayBuffer(length)
  const view = new DataView(arrayBuffer)
  const channels: Float32Array[] = []
  let offset = 0
  let pos = 0

  // 写入WAV头部
  function setUint16(data: number) {
    view.setUint16(pos, data, true)
    pos += 2
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true)
    pos += 4
  }

  // RIFF标识符
  setUint32(0x46464952) // "RIFF"
  setUint32(length - 8) // 文件长度
  setUint32(0x45564157) // "WAVE"

  // fmt子块
  setUint32(0x20746d66) // "fmt "
  setUint32(16) // 子块大小
  setUint16(1) // 音频格式 (PCM)
  setUint16(buffer.numberOfChannels)
  setUint32(buffer.sampleRate)
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels) // 字节率
  setUint16(buffer.numberOfChannels * 2) // 块对齐
  setUint16(16) // 位深度

  // data子块
  setUint32(0x61746164) // "data"
  setUint32(length - pos - 4)

  // 写入音频数据
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i))
  }

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const sample = Math.max(-1, Math.min(1, channels[i][offset]))
      view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      pos += 2
    }
    offset++
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

/**
 * 获取变声效果配置
 */
export function getVoiceEffectConfig(type: VoiceEffectType): VoiceEffectConfig {
  return VOICE_EFFECTS[type]
}

