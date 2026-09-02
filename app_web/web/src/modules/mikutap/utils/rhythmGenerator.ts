import { BackgroundMusic } from '../types';

export class RhythmGenerator {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private oscillator: OscillatorNode | null = null;
  private nextNoteTime: number = 0;
  private scheduledNotes: number[] = [];
  private currentPattern: number[] = [];
  private currentPatternIndex: number = 0;
  private timeoutId: number | null = null;
  private isPlaying: boolean = false;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.gainNode = audioContext.createGain();
    this.gainNode.connect(audioContext.destination);
  }

  // 重新连接音频输出节点
  public reconnectOutput(destination: AudioNode) {
    this.gainNode.disconnect();
    this.gainNode.connect(destination);
  }

  // 获取增益节点（用于外部连接）
  public getGainNode(): GainNode {
    return this.gainNode;
  }

  private scheduleNote(time: number, volume: number, duration: number, frequency: number, type: OscillatorType) {
    const osc = this.audioContext.createOscillator();
    const noteGain = this.audioContext.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    // 设置音量包络
    noteGain.gain.setValueAtTime(0, time);
    noteGain.gain.linearRampToValueAtTime(volume, time + 0.01);
    noteGain.gain.linearRampToValueAtTime(0, time + duration);
    
    osc.connect(noteGain);
    noteGain.connect(this.gainNode);
    
    osc.start(time);
    osc.stop(time + duration);
    
    // 存储计划的音符时间，用于停止时清理
    this.scheduledNotes.push(time);
  }

  private scheduler(music: BackgroundMusic) {
    const { bpm, timeSignature, rhythmPattern } = music;
    if (!rhythmPattern) return;
    
    const secondsPerBeat = 60.0 / bpm;
    
    while (this.nextNoteTime < this.audioContext.currentTime + 0.1) {
      const volume = this.currentPattern[this.currentPatternIndex] * rhythmPattern.volume;
      
      if (volume > 0) {
        // 根据是否为重音设置不同的频率
        const frequency = volume >= 1 ? 880 : 440;
        this.scheduleNote(
          this.nextNoteTime,
          volume,
          secondsPerBeat * 0.25, // 音符持续时间为一拍的1/4
          frequency,
          rhythmPattern.soundType
        );
      }
      
      // 更新下一个音符的时间和索引
      this.nextNoteTime += secondsPerBeat;
      this.currentPatternIndex = (this.currentPatternIndex + 1) % this.currentPattern.length;
      
      // 如果完成一个循环且不需要循环播放，则停止
      if (!music.loop && this.currentPatternIndex === 0) {
        this.stop();
        break;
      }
    }
    
    // 继续调度下一批音符
    if (this.isPlaying) {
      this.timeoutId = window.setTimeout(() => this.scheduler(music), 25);
    }
  }

  public start(music: BackgroundMusic) {
    if (!music.rhythmPattern || !music.rhythmPattern.enabled) return;
    
    this.stop();
    this.isPlaying = true;
    this.currentPattern = music.rhythmPattern.pattern;
    this.currentPatternIndex = 0;
    this.nextNoteTime = this.audioContext.currentTime;
    this.gainNode.gain.value = music.rhythmPattern.volume;
    
    this.scheduler(music);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    // 清理所有计划的音符
    const currentTime = this.audioContext.currentTime;
    this.scheduledNotes = this.scheduledNotes.filter(time => {
      if (time > currentTime) {
        return false;
      }
      return true;
    });
  }

  public setVolume(volume: number) {
    this.gainNode.gain.value = volume;
  }
} 