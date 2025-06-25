 /**
 * 音频生成工具
 * 用于在没有音频文件时生成合成音效
 */

export class AudioGenerator {
    private audioContext: AudioContext | null = null;
    private isInitialized = false;
  
    /**
     * 初始化音频上下文
     */
    async initialize(): Promise<boolean> {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        
        this.isInitialized = true;
        return true;
      } catch (error) {
        console.error('音频上下文初始化失败:', error);
        return false;
      }
    }
  
    /**
     * 播放合成音效
     */
    playTone(
      frequency: number,
      duration: number = 0.3,
      volume: number = 0.1,
      waveType: OscillatorType = 'sine'
    ): void {
      if (!this.audioContext || !this.isInitialized) {
        console.warn('音频上下文未初始化');
        return;
      }
  
      try {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // 连接音频节点
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 设置音频参数
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = waveType;
        
        // 设置音量包络
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        // 播放音效
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
        
      } catch (error) {
        console.error('播放音效失败:', error);
      }
    }
  
    /**
     * 根据音效ID获取对应的音调参数
     */
    getSoundParams(soundId: string): { frequency: number; waveType: OscillatorType } {
      // 钢琴音阶频率 (C5-C6)
      const pianoFreqs: Record<string, number> = {
        'q': 523.25, // C5
        'w': 587.33, // D5
        'e': 659.25, // E5
        'r': 698.46, // F5
        't': 783.99, // G5
        'y': 880.00, // A5
        'u': 987.77, // B5
        'i': 1046.50, // C6
        'o': 1174.66, // D6
        'p': 1318.51, // E6
      };
  
      // 鼓点音效频率
      const drumFreqs: Record<string, number> = {
        'a': 60,   // 低频鼓
        's': 80,   
        'd': 100,  
        'f': 120,  
        'g': 140,  
        'h': 160,  
        'j': 180,  
        'k': 200,  
        'l': 220,  // 高频鼓
      };
  
      // 特效音频率
      const effectFreqs: Record<string, number> = {
        'z': 150,
        'x': 200,
        'c': 300,
        'v': 400,
        'b': 500,
        'n': 600,
        'm': 800,
      };
  
      // 确定音效类型和参数
      if (pianoFreqs[soundId]) {
        return { frequency: pianoFreqs[soundId], waveType: 'sine' };
      } else if (drumFreqs[soundId]) {
        return { frequency: drumFreqs[soundId], waveType: 'square' };
      } else if (effectFreqs[soundId]) {
        return { frequency: effectFreqs[soundId], waveType: 'sawtooth' };
      }
  
      // 默认参数
      return { frequency: 440, waveType: 'sine' };
    }
  
    /**
     * 播放指定ID的音效
     */
    playSoundById(soundId: string, intensity: number = 1, masterVolume: number = 0.7): void {
      const { frequency, waveType } = this.getSoundParams(soundId);
      const volume = 0.1 * intensity * masterVolume;
      
      // 根据音效类型调整持续时间
      let duration = 0.3;
      if (soundId.match(/[asdfghjkl]/)) {
        duration = 0.15; // 鼓点音效更短
      } else if (soundId.match(/[zxcvbnm]/)) {
        duration = 0.5; // 特效音效稍长
      }
  
      this.playTone(frequency, duration, volume, waveType);
    }
  
    /**
     * 销毁音频上下文
     */
    destroy(): void {
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }
      this.audioContext = null;
      this.isInitialized = false;
    }
  }
  
  // 全局音频生成器实例
  let globalAudioGenerator: AudioGenerator | null = null;
  
  /**
   * 获取全局音频生成器实例
   */
  export function getAudioGenerator(): AudioGenerator {
    if (!globalAudioGenerator) {
      globalAudioGenerator = new AudioGenerator();
    }
    return globalAudioGenerator;
  }
  
  /**
   * 初始化全局音频生成器
   */
  export async function initializeGlobalAudioGenerator(): Promise<boolean> {
    const generator = getAudioGenerator();
    return await generator.initialize();
  }
  
  /**
   * 播放测试音效
   */
  export function playTestSound(
    soundId: string, 
    intensity: number = 1, 
    masterVolume: number = 0.7
  ): void {
    const generator = getAudioGenerator();
    generator.playSoundById(soundId, intensity, masterVolume);
  }