/**
 * Web Worker for audio processing
 * 用于处理音频编码等耗时操作，避免阻塞主线程
 */

// Web Worker代码
const workerCode = `
  // 在Worker中处理音频编码
  self.onmessage = async function(e) {
    const { id, type, data } = e.data;
    
    try {
      switch (type) {
        case 'blobToBase64': {
          const blob = data.blob;
          const arrayBuffer = await blob.arrayBuffer();
          
          // 检测MIME类型
          let mimeType = blob.type;
          if (!mimeType) {
            const uint8Array = new Uint8Array(arrayBuffer);
            const signature = Array.from(uint8Array.slice(0, 4))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('');
            
            if (signature.startsWith('52494646')) { // RIFF
              mimeType = 'audio/wav';
            } else if (signature.startsWith('fffb') || signature.startsWith('fff3')) { // MP3
              mimeType = 'audio/mpeg';
            } else {
              mimeType = 'audio/wav'; // 默认
            }
          }
          
          // 转换为Base64
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          self.postMessage({
            id,
            success: true,
            result: base64,
            mimeType
          });
          break;
        }
        
        case 'compressAudio': {
          // 音频压缩逻辑（简化版）
          const blob = data.blob;
          const quality = data.quality || 0.7;
          
          // 这里可以实现音频压缩逻辑
          // 目前先直接返回原始数据
          const arrayBuffer = await blob.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          self.postMessage({
            id,
            success: true,
            result: base64,
            originalSize: blob.size,
            compressedSize: blob.size // 实际压缩后的大小
          });
          break;
        }
        
        default:
          throw new Error('Unknown worker task type: ' + type);
      }
    } catch (error) {
      self.postMessage({
        id,
        success: false,
        error: error.message
      });
    }
  };
`;

/**
 * 音频处理Worker管理器
 */
export class AudioWorker {
  private worker: Worker | null = null;
  private pendingTasks = new Map<string, { resolve: Function; reject: Function }>();

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    try {
      // 创建Worker
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      this.worker = new Worker(workerUrl);

      // 监听Worker消息
      this.worker.onmessage = (e) => {
        const { id, success, result, error, ...extra } = e.data;
        const task = this.pendingTasks.get(id);
        
        if (task) {
          this.pendingTasks.delete(id);
          if (success) {
            task.resolve({ result, ...extra });
          } else {
            task.reject(new Error(error));
          }
        }
      };

      this.worker.onerror = (error) => {
        console.error('Audio Worker error:', error);
      };

      URL.revokeObjectURL(workerUrl);
    } catch (error) {
      console.warn('Web Worker not supported, falling back to main thread');
      this.worker = null;
    }
  }

  /**
   * 在Worker中将Blob转换为Base64
   */
  public async blobToBase64(blob: Blob): Promise<string> {
    if (!this.worker) {
      // 回退到主线程处理
      return this.blobToBase64MainThread(blob);
    }

    const taskId = `task_${Date.now()}_${Math.random()}`;
    
    return new Promise((resolve, reject) => {
      this.pendingTasks.set(taskId, { resolve, reject });
      
      this.worker!.postMessage({
        id: taskId,
        type: 'blobToBase64',
        data: { blob }
      });
      
      // 设置超时
      setTimeout(() => {
        if (this.pendingTasks.has(taskId)) {
          this.pendingTasks.delete(taskId);
          reject(new Error('Worker task timeout'));
        }
      }, 60000); // 60秒超时
    });
  }

  /**
   * 压缩音频文件
   */
  public async compressAudio(blob: Blob, quality: number = 0.7): Promise<{
    result: string;
    originalSize: number;
    compressedSize: number;
  }> {
    if (!this.worker) {
      // 回退到主线程处理
      const base64 = await this.blobToBase64MainThread(blob);
      return {
        result: base64,
        originalSize: blob.size,
        compressedSize: blob.size
      };
    }

    const taskId = `compress_${Date.now()}_${Math.random()}`;
    
    return new Promise((resolve, reject) => {
      this.pendingTasks.set(taskId, { resolve, reject });
      
      this.worker!.postMessage({
        id: taskId,
        type: 'compressAudio',
        data: { blob, quality }
      });
      
      // 设置超时
      setTimeout(() => {
        if (this.pendingTasks.has(taskId)) {
          this.pendingTasks.delete(taskId);
          reject(new Error('Worker compression timeout'));
        }
      }, 120000); // 2分钟超时
    });
  }

  /**
   * 主线程回退方案
   */
  private async blobToBase64MainThread(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1] || result;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 销毁Worker
   */
  public destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingTasks.clear();
  }
}

// 单例导出
export const audioWorker = new AudioWorker(); 