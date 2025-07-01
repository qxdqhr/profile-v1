/**
 * 统一音频管理器
 * 解决背景音乐和音效播放冲突问题
 */

import { GridCell, BackgroundMusic } from '../types';
import { RhythmGenerator } from './rhythmGenerator';

export class UnifiedAudioManager {
  private static instance: UnifiedAudioManager | null = null;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;
  private rhythmGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  
  // 背景音乐相关
  private currentMusicSource: AudioBufferSourceNode | null = null;
  private currentMusicElement: HTMLAudioElement | null = null;
  private rhythmGenerator: RhythmGenerator | null = null;
  
  // 音效相关
  private activeOscillators: Set<OscillatorNode> = new Set();
  
  private constructor() {}
  
  public static getInstance(): UnifiedAudioManager {
    if (!UnifiedAudioManager.instance) {
      UnifiedAudioManager.instance = new UnifiedAudioManager();
    }
    return UnifiedAudioManager.instance;
  }
  
  /**
   * 初始化音频系统
   */
  public async initialize(): Promise<boolean> {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return true;
    }
    
    if (typeof window === 'undefined') return false;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 创建主增益节点
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.8;
      
      // 创建音乐增益节点
      this.musicGain = this.audioContext.createGain();
      this.musicGain.gain.value = 0.6;
      
      // 创建音效增益节点
      this.effectsGain = this.audioContext.createGain();
      this.effectsGain.gain.value = 0.8;
      
      // 创建节奏增益节点
      this.rhythmGain = this.audioContext.createGain();
      this.rhythmGain.gain.value = 0.4;
      
      // 创建压缩器
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-24, this.audioContext.currentTime);
      this.compressor.knee.setValueAtTime(30, this.audioContext.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.audioContext.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);
      
      // 连接音频图
      this.musicGain.connect(this.masterGain);
      this.effectsGain.connect(this.masterGain);
      this.rhythmGain.connect(this.masterGain);
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.audioContext.destination);
      
      // 初始化节奏生成器
      this.rhythmGenerator = new RhythmGenerator(this.audioContext);
      // 重新连接节奏生成器到我们的节奏增益节点
      this.rhythmGenerator.reconnectOutput(this.rhythmGain);
      
      console.log('🎵 统一音频管理器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 音频管理器初始化失败:', error);
      return false;
    }
  }
  
  /**
   * 播放背景音乐
   */
  public async playBackgroundMusic(music: BackgroundMusic): Promise<void> {
    if (!this.audioContext || !this.musicGain) {
      await this.initialize();
    }
    
    // 停止当前音乐
    this.stopBackgroundMusic();
    
    try {
      if (music.fileType === 'uploaded' && music.file.startsWith('data:')) {
        // 上传的音乐文件使用 HTML Audio
        this.currentMusicElement = new Audio(music.file);
        this.currentMusicElement.volume = music.volume * 0.6; // 降低背景音乐音量
        this.currentMusicElement.loop = music.loop;
        await this.currentMusicElement.play();
      } else if (music.fileType === 'generated') {
        // 生成的音乐使用 AudioContext
        const response = await fetch(music.file);
        const audioData = await response.arrayBuffer();
        const buffer = await this.audioContext!.decodeAudioData(audioData);
        
        this.currentMusicSource = this.audioContext!.createBufferSource();
        this.currentMusicSource.buffer = buffer;
        this.currentMusicSource.loop = music.loop;
        
        const musicVolumeGain = this.audioContext!.createGain();
        musicVolumeGain.gain.value = music.volume;
        
        this.currentMusicSource.connect(musicVolumeGain);
        musicVolumeGain.connect(this.musicGain!);
        this.currentMusicSource.start();
      }
      
      // 启动节奏
      if (music.rhythmPattern.enabled && this.rhythmGenerator) {
        this.rhythmGenerator.start(music);
      }
      
      console.log('🎵 背景音乐播放成功:', music.name);
    } catch (error) {
      console.error('❌ 背景音乐播放失败:', error);
    }
  }
  
  /**
   * 停止背景音乐
   */
  public stopBackgroundMusic(): void {
    if (this.currentMusicSource) {
      this.currentMusicSource.stop();
      this.currentMusicSource.disconnect();
      this.currentMusicSource = null;
    }
    
    if (this.currentMusicElement) {
      this.currentMusicElement.pause();
      this.currentMusicElement.currentTime = 0;
      this.currentMusicElement = null;
    }
    
    if (this.rhythmGenerator) {
      this.rhythmGenerator.stop();
    }
  }
  
  /**
   * 播放音效
   */
  public async playEffect(cell: GridCell, intensity: number = 1, masterVolume: number = 1): Promise<void> {
    console.log('🎵 [AudioManager] playEffect 开始', { cell: cell.key, enabled: cell.enabled, soundSource: cell.soundSource });
    
    if (!this.audioContext || !this.effectsGain) {
      console.log('🎵 [AudioManager] 音频上下文未初始化，正在初始化...');
      await this.initialize();
    }
    
    if (!cell.enabled) {
      console.log('🎵 [AudioManager] 单元格未启用，跳过播放');
      return;
    }
    
    const cellVolume = (cell.volume || 70) / 100;
    const volume = intensity * masterVolume * cellVolume * 0.8; // 限制音效音量
    console.log('🎵 [AudioManager] 音量计算', { cellVolume, volume, intensity, masterVolume });
    
    try {
      if (cell.soundSource === 'file' && cell.audioFile) {
        console.log('🎵 [AudioManager] 播放音频文件:', cell.audioFile);
        // 播放音频文件
        const response = await fetch(cell.audioFile);
        const audioData = await response.arrayBuffer();
        const buffer = await this.audioContext!.decodeAudioData(audioData);
        
        const source = this.audioContext!.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext!.createGain();
        gainNode.gain.value = volume;
        
        source.connect(gainNode);
        gainNode.connect(this.effectsGain!);
        source.start();
        console.log('🎵 [AudioManager] 音频文件播放成功');
      } else {
        console.log('🎵 [AudioManager] 播放合成音效', { frequency: cell.frequency || 440, waveType: cell.waveType });
        // 播放合成音效
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.frequency.setValueAtTime(
          cell.frequency || 440, 
          this.audioContext!.currentTime
        );
        oscillator.type = cell.waveType;
        
        // 设置音效包络
        const now = this.audioContext!.currentTime;
        const duration = this.getSoundDuration(cell.soundType);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.effectsGain!);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        this.activeOscillators.add(oscillator);
        console.log('🎵 [AudioManager] 合成音效播放成功', { duration, volume });
        
        // 清理完成的振荡器
        oscillator.onended = () => {
          this.activeOscillators.delete(oscillator);
          try {
            gainNode.disconnect();
            oscillator.disconnect();
          } catch (error) {
            // 忽略错误
          }
        };
      }
    } catch (error) {
      console.error('❌ 音效播放失败:', error);
    }
  }
  
  /**
   * 设置主音量
   */
  public setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }
  
  /**
   * 设置音乐音量
   */
  public setMusicVolume(volume: number): void {
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }
  
  /**
   * 设置音效音量
   */
  public setEffectsVolume(volume: number): void {
    if (this.effectsGain) {
      this.effectsGain.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }
  
  /**
   * 获取音频上下文
   */
  public getAudioContext(): AudioContext | null {
    return this.audioContext;
  }
  
  /**
   * 获取音效持续时间
   */
  private getSoundDuration(soundType: string): number {
    switch (soundType) {
      case 'drum': return 0.15;
      case 'piano': return 0.8;
      case 'synth': return 0.5;
      default: return 0.3;
    }
  }
  
  /**
   * 销毁音频管理器
   */
  public destroy(): void {
    this.stopBackgroundMusic();
    
    // 停止所有活跃的振荡器
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (error) {
        // 忽略错误
      }
    });
    this.activeOscillators.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.masterGain = null;
    this.musicGain = null;
    this.effectsGain = null;
    this.rhythmGain = null;
    this.compressor = null;
    this.rhythmGenerator = null;
  }
}

// 导出单例实例
export const audioManager = UnifiedAudioManager.getInstance(); 