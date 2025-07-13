/**
 * 文件处理器模块统一导出
 */

// 处理器实现
export { ImageProcessor } from './ImageProcessor';
export { AudioProcessor } from './AudioProcessor';
export { VideoProcessor } from './VideoProcessor';

// 队列管理
export { ProcessingQueue } from './ProcessingQueue';
export type {
  QueueTask,
  TaskPriority,
  TaskStatus,
  QueueOptions,
  QueueStats
} from './ProcessingQueue';

// 导入队列类型以在文件中使用
import { ProcessingQueue } from './ProcessingQueue';
import type { QueueOptions, QueueStats, QueueTask, TaskPriority } from './ProcessingQueue';

// 处理器工厂
import { ImageProcessor } from './ImageProcessor';
import { AudioProcessor } from './AudioProcessor';
import { VideoProcessor } from './VideoProcessor';
import type { IFileProcessor, ProcessorType } from '../types';

/**
 * 文件处理器工厂
 */
export class ProcessorFactory {
  private static processors: Map<ProcessorType, () => IFileProcessor> = new Map();

  // 静态初始化处理器映射
  static {
    this.processors.set('image', () => new ImageProcessor());
    this.processors.set('audio', () => new AudioProcessor());
    this.processors.set('video', () => new VideoProcessor());
  }

  /**
   * 创建处理器实例
   */
  static createProcessor(type: ProcessorType): IFileProcessor {
    const processorFactory = this.processors.get(type);
    if (!processorFactory) {
      throw new Error(`不支持的处理器类型: ${type}`);
    }
    
    return processorFactory();
  }

  /**
   * 获取所有支持的处理器类型
   */
  static getSupportedTypes(): ProcessorType[] {
    return Array.from(this.processors.keys());
  }

  /**
   * 检查是否支持指定的处理器类型
   */
  static supports(type: ProcessorType): boolean {
    return this.processors.has(type);
  }

  /**
   * 注册新的处理器类型
   */
  static registerProcessor(type: ProcessorType, factory: () => IFileProcessor): void {
    this.processors.set(type, factory);
    console.log(`🔧 [ProcessorFactory] 注册处理器类型: ${type}`);
  }

  /**
   * 批量创建并初始化所有处理器
   */
  static async createAllProcessors(): Promise<Map<ProcessorType, IFileProcessor>> {
    const processors = new Map<ProcessorType, IFileProcessor>();
    
    console.log('🏭 [ProcessorFactory] 创建并初始化所有处理器...');
    
    for (const type of this.getSupportedTypes()) {
      try {
        const processor = this.createProcessor(type);
        await processor.initialize();
        processors.set(type, processor);
        console.log(`✅ [ProcessorFactory] ${type} 处理器初始化完成`);
      } catch (error) {
        console.error(`❌ [ProcessorFactory] ${type} 处理器初始化失败:`, error);
      }
    }
    
    console.log(`🎉 [ProcessorFactory] 成功初始化 ${processors.size} 个处理器`);
    
    return processors;
  }
}

/**
 * 处理器管理器
 * 提供统一的处理器管理和调度功能
 */
export class ProcessorManager {
  private processors: Map<ProcessorType, IFileProcessor> = new Map();
  private queue: ProcessingQueue;
  private isInitialized = false;

  constructor(queueOptions?: QueueOptions) {
    this.queue = new ProcessingQueue(queueOptions);
    console.log('🎛️ [ProcessorManager] 处理器管理器已创建');
  }

  /**
   * 初始化所有处理器
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('⚠️ [ProcessorManager] 管理器已经初始化');
      return;
    }

    console.log('🚀 [ProcessorManager] 初始化处理器管理器...');

    try {
      // 创建并初始化所有处理器
      this.processors = await ProcessorFactory.createAllProcessors();

      // 注册处理器到队列
      for (const [type, processor] of Array.from(this.processors.entries())) {
        this.queue.registerProcessor(processor);
      }

      this.isInitialized = true;
      console.log('✅ [ProcessorManager] 处理器管理器初始化完成');

    } catch (error) {
      console.error('❌ [ProcessorManager] 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 获取处理器实例
   */
  getProcessor(type: ProcessorType): IFileProcessor | undefined {
    return this.processors.get(type);
  }

  /**
   * 获取队列实例
   */
  getQueue(): ProcessingQueue {
    return this.queue;
  }

  /**
   * 检查是否已初始化
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * 获取所有已初始化的处理器
   */
  getAllProcessors(): Map<ProcessorType, IFileProcessor> {
    return new Map(this.processors);
  }

  /**
   * 处理单个文件
   */
  async processFile(
    inputPath: string,
    outputPath: string,
    options: import('../types').ProcessingOptions
  ): Promise<import('../types').ProcessingResult> {
    this.ensureInitialized();

    const processor = this.processors.get(options.type);
    if (!processor) {
      throw new Error(`未找到类型为 ${options.type} 的处理器`);
    }

    return processor.process(inputPath, outputPath, options);
  }

  /**
   * 添加文件到处理队列
   */
  queueFile(
    inputPath: string,
    outputPath: string,
    options: import('../types').ProcessingOptions,
    taskOptions?: Partial<Pick<QueueTask, 'priority' | 'maxRetries' | 'onProgress' | 'onComplete' | 'onError'>>
  ): string {
    this.ensureInitialized();

    return this.queue.addTask(inputPath, outputPath, options, taskOptions);
  }

  /**
   * 批量处理文件
   */
  async batchProcess(
    tasks: Array<{
      inputPath: string;
      outputPath: string;
      options: import('../types').ProcessingOptions;
      priority?: TaskPriority;
    }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<Map<string, import('../types').ProcessingResult>> {
    this.ensureInitialized();

    return new Promise((resolve) => {
      this.queue.addBatchTasks(
        tasks,
        onProgress,
        (results: Map<string, import('../types').ProcessingResult>) => resolve(results)
      );
    });
  }

  /**
   * 获取支持的文件类型
   */
  getSupportedMimeTypes(): Record<ProcessorType, string[]> {
    const supportedTypes: Record<ProcessorType, string[]> = {} as any;

    for (const [type, processor] of Array.from(this.processors.entries())) {
      // 这里应该从处理器获取支持的MIME类型
      // 由于接口中没有定义这个方法，我们使用已知的类型
      switch (type) {
        case 'image':
          supportedTypes[type] = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
            'image/avif', 'image/gif', 'image/tiff', 'image/bmp'
          ];
          break;
        case 'audio':
          supportedTypes[type] = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
            'audio/aac', 'audio/m4a', 'audio/flac', 'audio/webm'
          ];
          break;
        case 'video':
          supportedTypes[type] = [
            'video/mp4', 'video/x-msvideo', 'video/quicktime',
            'video/webm', 'video/ogg', 'video/3gpp'
          ];
          break;
      }
    }

    return supportedTypes;
  }

  /**
   * 检查文件是否支持处理
   */
  canProcess(mimeType: string): { canProcess: boolean; processorType?: ProcessorType } {
    for (const [type, processor] of Array.from(this.processors.entries())) {
      if (processor.supports(mimeType)) {
        return { canProcess: true, processorType: type };
      }
    }

    return { canProcess: false };
  }

  /**
   * 获取处理器统计信息
   */
  getStats(): {
    processorsCount: number;
    queueStats: QueueStats;
    healthStatus: ReturnType<ProcessingQueue['getHealthStatus']>;
  } {
    return {
      processorsCount: this.processors.size,
      queueStats: this.queue.getStats(),
      healthStatus: this.queue.getHealthStatus()
    };
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    console.log('🧹 [ProcessorManager] 清理处理器资源...');

    // 停止队列
    this.queue.stop();

    // 清理队列中的任务
    this.queue.cleanup();

    console.log('✅ [ProcessorManager] 资源清理完成');
  }

  // ============= 私有方法 =============

  /**
   * 确保管理器已初始化
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('ProcessorManager 未初始化，请先调用 initialize() 方法');
    }
  }
}

// 默认导出处理器管理器实例
export const defaultProcessorManager = new ProcessorManager();

/**
 * 快速处理文件的便捷函数
 */
export async function processFile(
  inputPath: string,
  outputPath: string,
  options: import('../types').ProcessingOptions
): Promise<import('../types').ProcessingResult> {
  if (!defaultProcessorManager.isReady()) {
    await defaultProcessorManager.initialize();
  }

  return defaultProcessorManager.processFile(inputPath, outputPath, options);
}

/**
 * 快速添加文件到队列的便捷函数
 */
export function queueFile(
  inputPath: string,
  outputPath: string,
  options: import('../types').ProcessingOptions,
  taskOptions?: Partial<Pick<QueueTask, 'priority' | 'maxRetries' | 'onProgress' | 'onComplete' | 'onError'>>
): string {
  if (!defaultProcessorManager.isReady()) {
    throw new Error('处理器管理器未初始化，请先调用 initialize() 方法');
  }

  return defaultProcessorManager.queueFile(inputPath, outputPath, options, taskOptions);
} 