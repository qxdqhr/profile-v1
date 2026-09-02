/**
 * 音频数据处理工具函数
 */

/**
 * 将AudioBuffer转换为WAV格式的Blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numberOfChannels = buffer.numberOfChannels;
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
  const view = new DataView(arrayBuffer);
  
  // WAV 文件头
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * numberOfChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * numberOfChannels * 2, true);
  
  // 写入音频数据
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * 将AudioBuffer转换为Base64编码的WAV数据
 * 支持服务器端和客户端环境
 */
export async function audioBufferToBase64(buffer: AudioBuffer): Promise<string> {
  const wavBlob = audioBufferToWav(buffer);
  return await blobToBase64(wavBlob);
}

/**
 * 异步版本的AudioBuffer转Base64
 */
export async function audioBufferToBase64Async(buffer: AudioBuffer): Promise<string> {
  const wavBlob = audioBufferToWav(buffer);
  return await blobToBase64(wavBlob);
}

/**
 * 将Blob转换为Base64
 * 支持服务器端和客户端环境
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  // 检查是否在服务器端环境
  if (typeof window === 'undefined') {
    // 服务器端：直接处理ArrayBuffer
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString('base64');
      
      // 检测MIME类型
      let mimeType = blob.type;
      if (!mimeType) {
        // 通过文件头检测格式
        const signature = buffer.subarray(0, 4).toString('hex');
        if (signature.startsWith('52494646')) { // RIFF
          mimeType = 'audio/wav';
        } else if (signature.startsWith('fffb') || signature.startsWith('fff3')) { // MP3
          mimeType = 'audio/mpeg';
        } else {
          mimeType = 'audio/wav'; // 默认
        }
      }
      
      return base64Data; // 只返回base64数据，不包含data URL前缀
    } catch (error) {
      throw new Error(`服务器端Base64转换失败: ${error}`);
    }
  } else {
    // 客户端：使用FileReader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 提取base64数据部分（去掉data:audio/...;base64,前缀）
        const base64Data = result.split(',')[1] || result;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

/**
 * 将Base64数据转换为Blob
 * 支持服务器端和客户端环境
 */
export function base64ToBlob(base64: string): Blob {
  let data: string;
  let mimeType: string;
  
  if (base64.includes(',')) {
    const [header, base64Data] = base64.split(',');
    mimeType = header.match(/:(.*?);/)?.[1] || 'audio/wav';
    data = base64Data;
  } else {
    // 纯base64数据，没有data URL前缀
    data = base64;
    mimeType = 'audio/wav';
  }
  
  let arrayBuffer: ArrayBuffer;
  
  // 检查是否在服务器端环境
  if (typeof window === 'undefined') {
    // 服务器端：使用Buffer
    const buffer = Buffer.from(data, 'base64');
    arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  } else {
    // 客户端：使用atob
    const bytes = atob(data);
    arrayBuffer = new ArrayBuffer(bytes.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < bytes.length; i++) {
      uint8Array[i] = bytes.charCodeAt(i);
    }
  }
  
  return new Blob([arrayBuffer], { type: mimeType });
}

/**
 * 将Base64数据转换为URL（用于音频播放）
 */
export function base64ToUrl(base64: string): string {
  // 如果已经是data URL格式，直接返回
  if (base64.startsWith('data:')) {
    return base64;
  }
  
  // 否则构造data URL
  return `data:audio/wav;base64,${base64}`;
}

/**
 * 检测音频数据格式
 */
export function detectAudioFormat(base64: string): 'wav' | 'mp3' | 'ogg' | 'unknown' {
  if (base64.includes('data:audio/wav')) return 'wav';
  if (base64.includes('data:audio/mp3') || base64.includes('data:audio/mpeg')) return 'mp3';
  if (base64.includes('data:audio/ogg')) return 'ogg';
  return 'unknown';
}

/**
 * 估算音频数据大小（字节）
 */
export function estimateAudioSize(base64: string): number {
  // Base64编码大约比原始数据大33%
  const base64Data = base64.split(',')[1] || base64;
  return Math.floor((base64Data.length * 3) / 4);
}

/**
 * 压缩音频质量（通过重新采样）
 * 仅在客户端环境中可用
 */
export function compressAudioBuffer(
  buffer: AudioBuffer, 
  targetSampleRate: number = 22050,
  targetChannels: number = 1
): AudioBuffer {
  // 检查是否在服务器端环境
  if (typeof window === 'undefined') {
    throw new Error('压缩音频功能仅在客户端环境中可用');
  }
  
  const audioContext = new AudioContext();
  const targetLength = Math.floor(buffer.length * (targetSampleRate / buffer.sampleRate));
  const compressedBuffer = audioContext.createBuffer(
    targetChannels, 
    targetLength, 
    targetSampleRate
  );
  
  // 简单的下采样
  const ratio = buffer.length / targetLength;
  
  for (let channel = 0; channel < targetChannels; channel++) {
    const inputChannel = Math.min(channel, buffer.numberOfChannels - 1);
    const inputData = buffer.getChannelData(inputChannel);
    const outputData = compressedBuffer.getChannelData(channel);
    
    for (let i = 0; i < targetLength; i++) {
      const sourceIndex = Math.floor(i * ratio);
      outputData[i] = inputData[sourceIndex];
    }
  }
  
  return compressedBuffer;
} 