/**
 * 音频生成工具
 * 用于在没有音频文件时生成合成音效，并支持外部音频文件播放
 */

import { GridCell, SoundType } from '../types';

export class AudioGenerator {
    private audioContext: AudioContext | null = null;
    private isInitialized = false;
    private audioBuffers: Map<string, AudioBuffer> = new Map();
    private loadingPromises: Map<string, Promise<ArrayBuffer>> = new Map();
  
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
     * 加载音频文件
     */
    async loadAudioFile(url: string): Promise<ArrayBuffer> {
      if (this.loadingPromises.has(url)) {
        return this.loadingPromises.get(url)!;
      }

      const loadPromise = fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load audio file: ${response.statusText}`);
          }
          return response.arrayBuffer();
        });

      this.loadingPromises.set(url, loadPromise);
      return loadPromise;
    }
  
    /**
     * 解码音频数据
     */
    async decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer> {
      if (!this.audioContext) {
        throw new Error('Audio context not initialized');
      }
      
      return this.audioContext.decodeAudioData(audioData);
    }
  
    /**
     * 创建音效滤波器
     */
    private createFilter(
      type: 'lowpass' | 'highpass' | 'bandpass',
      frequency: number,
      Q: number = 1
    ): BiquadFilterNode {
      if (!this.audioContext) {
        throw new Error('Audio context not initialized');
      }

      const filter = this.audioContext.createBiquadFilter();
      filter.type = type;
      filter.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      filter.Q.setValueAtTime(Q, this.audioContext.currentTime);
      return filter;
    }
  
    /**
     * 创建延迟效果
     */
    private createDelay(delayTime: number, feedback: number = 0.3): DelayNode {
      if (!this.audioContext) {
        throw new Error('Audio context not initialized');
      }

      const delay = this.audioContext.createDelay(1);
      const feedbackGain = this.audioContext.createGain();
      
      delay.delayTime.setValueAtTime(delayTime, this.audioContext.currentTime);
      feedbackGain.gain.setValueAtTime(feedback, this.audioContext.currentTime);
      
      delay.connect(feedbackGain);
      feedbackGain.connect(delay);
      
      return delay;
    }
  
    /**
     * 创建混响效果
     */
    private createReverb(roomSize: number): ConvolverNode {
      if (!this.audioContext) {
        throw new Error('Audio context not initialized');
      }

      const convolver = this.audioContext.createConvolver();
      const length = this.audioContext.sampleRate * roomSize;
      const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
      }

      convolver.buffer = impulse;
      return convolver;
    }
  
    /**
     * 播放合成音效
     */
    playTone(
      frequency: number,
      duration: number = 0.3,
      volume: number = 0.1,
      waveType: OscillatorType = 'sine',
      effects?: GridCell['effects']
    ): void {
      if (!this.audioContext || !this.isInitialized) {
        console.warn('音频上下文未初始化');
        return;
      }
  
      try {
        const oscillator = this.audioContext.createOscillator();
        let audioNode: AudioNode = oscillator;
        
        // 设置基础参数
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = waveType;

        // 应用音效处理
        if (effects) {
          // 滤波器
          if (effects.filter) {
            const filter = this.createFilter(
              effects.filter.type,
              effects.filter.frequency,
              effects.filter.Q
            );
            audioNode.connect(filter);
            audioNode = filter;
          }

          // 延迟
          if (effects.delay && effects.delay > 0) {
            const delay = this.createDelay(effects.delay / 100);
            audioNode.connect(delay);
            delay.connect(this.audioContext.destination);
          }

          // 混响
          if (effects.reverb && effects.reverb > 0) {
            const reverb = this.createReverb(effects.reverb / 100);
            audioNode.connect(reverb);
            reverb.connect(this.audioContext.destination);
          }
        }

        // 创建增益节点（音量控制和包络）
        const gainNode = this.audioContext.createGain();
        audioNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 设置包络
        const now = this.audioContext.currentTime;
        if (effects?.envelope) {
          const { attack, decay, sustain, release } = effects.envelope;
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(volume, now + attack);
          gainNode.gain.linearRampToValueAtTime(volume * sustain, now + attack + decay);
          gainNode.gain.setValueAtTime(volume * sustain, now + duration - release);
          gainNode.gain.linearRampToValueAtTime(0, now + duration);
        } else {
          // 默认包络
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        }
        
        // 播放音效
        oscillator.start(now);
        oscillator.stop(now + duration);
        
      } catch (error) {
        console.error('播放音效失败:', error);
      }
    }
  
    /**
     * 播放音频文件
     */
    async playAudioFile(
      audioBuffer: ArrayBuffer | AudioBuffer,
      volume: number = 0.1,
      effects?: GridCell['effects']
    ): Promise<void> {
      if (!this.audioContext || !this.isInitialized) {
        console.warn('音频上下文未初始化');
        return;
      }

      try {
        let buffer: AudioBuffer;
        
        if (audioBuffer instanceof ArrayBuffer) {
          buffer = await this.decodeAudioData(audioBuffer);
        } else {
          buffer = audioBuffer;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        let audioNode: AudioNode = source;

        // 应用音效处理
        if (effects) {
          if (effects.filter) {
            const filter = this.createFilter(
              effects.filter.type,
              effects.filter.frequency,
              effects.filter.Q
            );
            audioNode.connect(filter);
            audioNode = filter;
          }

          if (effects.delay && effects.delay > 0) {
            const delay = this.createDelay(effects.delay / 100);
            audioNode.connect(delay);
            delay.connect(this.audioContext.destination);
          }

          if (effects.reverb && effects.reverb > 0) {
            const reverb = this.createReverb(effects.reverb / 100);
            audioNode.connect(reverb);
            reverb.connect(this.audioContext.destination);
          }
        }

        // 音量控制
        const gainNode = this.audioContext.createGain();
        audioNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

        source.start();
      } catch (error) {
        console.error('播放音频文件失败:', error);
      }
    }
  
    /**
     * 根据网格单元格配置播放音效
     */
    async playSoundByCell(cell: GridCell, intensity: number = 1, masterVolume: number = 0.7): Promise<void> {
      if (!cell || !cell.enabled) {
        console.warn('单元格未启用或为空');
        return;
      }

      const cellVolume = (cell.volume || 70) / 100; // 转换百分比为小数
      const volume = 0.1 * intensity * masterVolume * cellVolume;

      try {
        if (cell.soundSource === 'file' && cell.audioFile) {
          // 播放外部音频文件
          const audioData = await this.loadAudioFile(cell.audioFile);
          await this.playAudioFile(audioData, volume, cell.effects);
        } else if (cell.soundSource === 'file' && cell.audioBuffer) {
          // 播放已加载的音频缓冲区
          await this.playAudioFile(cell.audioBuffer, volume, cell.effects);
        } else {
          // 播放合成音效
          const frequency = cell.frequency || this.getDefaultFrequency(cell.soundType, 0);
          const duration = this.getSoundDuration(cell.soundType);
          
          this.playTone(frequency, duration, volume, cell.waveType, cell.effects);
        }
      } catch (error) {
        console.error('播放单元格音效失败:', error);
        // 降级到合成音效
        const frequency = cell.frequency || 440;
        const duration = this.getSoundDuration(cell.soundType);
        this.playTone(frequency, duration, volume, cell.waveType);
      }
    }
  
    /**
     * 获取默认频率
     */
    private getDefaultFrequency(soundType: SoundType, index: number): number {
      const frequencies: Record<SoundType, number[]> = {
        piano: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25],
        drum: [60, 80, 100, 120, 140, 160, 180, 200, 220],
        synth: [110, 146.83, 196, 246.94, 329.63, 415.30, 523.25],
        bass: [41.20, 46.25, 51.91, 55.00, 61.74, 69.30, 77.78],
        lead: [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77],
        pad: [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94],
        fx: [200, 400, 800, 1600, 3200],
        vocal: [261.63, 293.66, 329.63, 392.00, 440.00],
        custom: [440]
      };

      const typeFreqs = frequencies[soundType] || frequencies.custom;
      return typeFreqs[index % typeFreqs.length] || 440;
    }
  
    /**
     * 获取音效持续时间
     */
    private getSoundDuration(soundType: SoundType): number {
      const durations: Record<SoundType, number> = {
        piano: 0.8,
        drum: 0.2,
        synth: 0.5,
        bass: 1.0,
        lead: 0.6,
        pad: 2.0,
        fx: 1.5,
        vocal: 1.0,
        custom: 0.5
      };

      return durations[soundType] || 0.5;
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