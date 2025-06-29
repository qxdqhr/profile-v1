import { getAudioGenerator } from './audioGenerator';

interface Note {
  frequency: number;
  duration: number;
  volume?: number;
}

interface ChordProgression {
  name: string;
  chords: number[][];
  tempo: number;
  timeSignature: {
    numerator: number;
    denominator: number;
  };
}

interface MusicGenerationConfig {
  bpm: number;
  chordProgression: 'happy' | 'sad' | 'energetic' | 'peaceful' | 'custom';
  customChords?: number[][];
  timeSignature: {
    numerator: number;
    denominator: number;
  };
  duration: number; // 秒
  volume: number;
  waveType: OscillatorType;
  enableHarmony: boolean;
  bassline: boolean;
}

export class MusicGenerator {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    this.initialize();
  }

  initialize() {
    if (typeof window !== 'undefined') {
      // If context doesn't exist or is closed, create a new one.
      if (!this.audioContext || this.audioContext.state === 'closed') {
        try {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          console.log('🎵 [MusicGenerator] AudioContext initialized/re-initialized. State:', this.audioContext.state);
          return true;
        } catch (e) {
          console.error('❌ Web Audio API is not supported in this browser.', e);
          return false;
        }
      }
    }
    return !!this.audioContext;
  }

  async ensureContext() {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      console.log('⚠️ [MusicGenerator] AudioContext is closed or not initialized. Re-initializing...');
      this.initialize();
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      console.log('⚠️ [MusicGenerator] AudioContext is suspended. Resuming...');
      await this.audioContext.resume();
    }
  }
  
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  // 音符频率对照表
  static readonly NOTE_FREQUENCIES = {
    'C': [261.63, 523.25, 1046.50],
    'C#': [277.18, 554.37, 1108.73],
    'D': [293.66, 587.33, 1174.66],
    'D#': [311.13, 622.25, 1244.51],
    'E': [329.63, 659.25, 1318.51],
    'F': [349.23, 698.46, 1396.91],
    'F#': [369.99, 739.99, 1479.98],
    'G': [392.00, 783.99, 1567.98],
    'G#': [415.30, 830.61, 1661.22],
    'A': [440.00, 880.00, 1760.00],
    'A#': [466.16, 932.33, 1864.66],
    'B': [493.88, 987.77, 1975.53]
  };

  // 预定义的和弦进行
  static readonly CHORD_PROGRESSIONS: Record<string, ChordProgression> = {
    HAPPY_C: {
      name: '欢乐C大调',
      chords: [
        [261.63, 329.63, 392.00], // C大三和弦
        [349.23, 440.00, 523.25], // F大三和弦
        [392.00, 493.88, 587.33], // G大三和弦
        [261.63, 329.63, 392.00], // C大三和弦
      ],
      tempo: 120,
      timeSignature: { numerator: 4, denominator: 4 }
    },
    SAD_A_MINOR: {
      name: '忧郁A小调',
      chords: [
        [220.00, 261.63, 329.63], // A小三和弦
        [293.66, 349.23, 440.00], // D小三和弦
        [392.00, 466.16, 587.33], // G大三和弦
        [220.00, 261.63, 329.63], // A小三和弦
      ],
      tempo: 80,
      timeSignature: { numerator: 4, denominator: 4 }
    },
    ENERGETIC_E: {
      name: '活力E大调',
      chords: [
        [329.63, 415.30, 493.88], // E大三和弦
        [220.00, 277.18, 329.63], // A大三和弦
        [493.88, 622.25, 739.99], // B大三和弦
        [329.63, 415.30, 493.88], // E大三和弦
      ],
      tempo: 140,
      timeSignature: { numerator: 4, denominator: 4 }
    },
    PEACEFUL_G: {
      name: '平和G大调',
      chords: [
        [392.00, 493.88, 587.33], // G大三和弦
        [261.63, 329.63, 392.00], // C大三和弦
        [293.66, 369.99, 440.00], // D大三和弦
        [392.00, 493.88, 587.33], // G大三和弦
      ],
      tempo: 70,
      timeSignature: { numerator: 3, denominator: 4 }
    }
  };

  // 主要的音乐生成方法 - 支持配置对象
  async generateMusic(config: Partial<MusicGenerationConfig>): Promise<AudioBuffer>;
  // 重载 - 支持简单的BPM参数（向后兼容）
  async generateMusic(bpm: number): Promise<AudioBuffer>;
  // 实现
  async generateMusic(configOrBpm: Partial<MusicGenerationConfig> | number): Promise<AudioBuffer> {
    if (!this.initialize()) {
      throw new Error('AudioContext not initialized');
    }

    let config: MusicGenerationConfig;
    
    if (typeof configOrBpm === 'number') {
      // 向后兼容的简单版本
      config = {
        bpm: configOrBpm,
        chordProgression: 'happy',
        timeSignature: { numerator: 4, denominator: 4 },
        duration: 8,
        volume: 0.5,
        waveType: 'sine',
        enableHarmony: true,
        bassline: false
      };
    } else {
      // 完整配置版本
      const defaultConfig: MusicGenerationConfig = {
        bpm: 120,
        chordProgression: 'happy',
        timeSignature: { numerator: 4, denominator: 4 },
        duration: 8,
        volume: 0.5,
        waveType: 'sine',
        enableHarmony: true,
        bassline: false
      };
      config = { ...defaultConfig, ...configOrBpm };
    }
    
    // 选择和弦进行
    let progression: ChordProgression;
    switch (config.chordProgression) {
      case 'sad':
        progression = MusicGenerator.CHORD_PROGRESSIONS.SAD_A_MINOR;
        break;
      case 'energetic':
        progression = MusicGenerator.CHORD_PROGRESSIONS.ENERGETIC_E;
        break;
      case 'peaceful':
        progression = MusicGenerator.CHORD_PROGRESSIONS.PEACEFUL_G;
        break;
      case 'custom':
        progression = {
          name: '自定义',
          chords: config.customChords || MusicGenerator.CHORD_PROGRESSIONS.HAPPY_C.chords,
          tempo: config.bpm,
          timeSignature: config.timeSignature
        };
        break;
      default:
        progression = MusicGenerator.CHORD_PROGRESSIONS.HAPPY_C;
    }

    // 更新和弦进行的配置
    progression.tempo = config.bpm;
    progression.timeSignature = config.timeSignature;

    return this.generateChordProgression(progression, config);
  }

  private async generateChordProgression(
    progression: ChordProgression, 
    config: MusicGenerationConfig
  ): Promise<AudioBuffer> {
    const sampleRate = this.audioContext!.sampleRate;
    const secondsPerBeat = 60 / progression.tempo;
    const beatsPerMeasure = progression.timeSignature.numerator;
    const totalMeasures = Math.ceil(config.duration / (secondsPerBeat * beatsPerMeasure));
    const totalDuration = totalMeasures * beatsPerMeasure * secondsPerBeat;
    
    const numberOfChannels = 2; // 立体声
    const length = sampleRate * totalDuration;
    const buffer = this.audioContext!.createBuffer(numberOfChannels, length, sampleRate);
    
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);

    // 生成音乐
    const chordsPerMeasure = Math.min(progression.chords.length, beatsPerMeasure);
    const chordDuration = secondsPerBeat * (beatsPerMeasure / chordsPerMeasure);

    for (let measure = 0; measure < totalMeasures; measure++) {
      for (let chordIndex = 0; chordIndex < chordsPerMeasure; chordIndex++) {
        const chord = progression.chords[chordIndex % progression.chords.length];
        const startTime = (measure * beatsPerMeasure + chordIndex * (beatsPerMeasure / chordsPerMeasure)) * secondsPerBeat;
        const startSample = Math.floor(startTime * sampleRate);
        const endSample = Math.floor((startTime + chordDuration) * sampleRate);

        // 生成和弦
        this.generateChordInBuffer(
          leftChannel, 
          rightChannel, 
          chord, 
          startSample, 
          endSample, 
          config,
          chordDuration
        );

        // 添加低音线
        if (config.bassline) {
          this.generateBasslineInBuffer(
            leftChannel,
            rightChannel,
            chord[0] / 2, // 低八度
            startSample,
            endSample,
            config,
            chordDuration
          );
        }
      }
    }

    return buffer;
  }

  private generateChordInBuffer(
    leftChannel: Float32Array,
    rightChannel: Float32Array,
    chord: number[],
    startSample: number,
    endSample: number,
    config: MusicGenerationConfig,
    duration: number
  ) {
    const fadeTime = 0.05; // 50ms淡入淡出
    const fadeSamples = fadeTime * this.audioContext!.sampleRate;

    for (let i = startSample; i < endSample && i < leftChannel.length; i++) {
      let leftSample = 0;
      let rightSample = 0;
      
      const t = i / this.audioContext!.sampleRate;
      const chordProgress = i - startSample;
      
      // 生成和弦音符
      chord.forEach((frequency, noteIndex) => {
        let noteVolume = config.volume / chord.length;
        
        // 为不同音符添加立体声效果
        const panLeft = 0.5 + (noteIndex - chord.length / 2) * 0.2;
        const panRight = 1 - panLeft;
        
        let sample = 0;
        switch (config.waveType) {
          case 'sine':
            sample = Math.sin(2 * Math.PI * frequency * t);
            break;
          case 'square':
            sample = Math.sign(Math.sin(2 * Math.PI * frequency * t));
            break;
          case 'sawtooth':
            sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
            break;
          case 'triangle':
            sample = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
            break;
        }
        
        leftSample += sample * noteVolume * panLeft;
        rightSample += sample * noteVolume * panRight;
      });
      
      // 应用淡入淡出
      let amplitude = 1;
      if (chordProgress < fadeSamples) {
        amplitude = chordProgress / fadeSamples;
      } else if (i > endSample - fadeSamples) {
        amplitude = (endSample - i) / fadeSamples;
      }
      
      leftChannel[i] += leftSample * amplitude;
      rightChannel[i] += rightSample * amplitude;
    }
  }

  private generateBasslineInBuffer(
    leftChannel: Float32Array,
    rightChannel: Float32Array,
    frequency: number,
    startSample: number,
    endSample: number,
    config: MusicGenerationConfig,
    duration: number
  ) {
    const bassVolume = config.volume * 0.6; // 低音稍微小一些
    
    for (let i = startSample; i < endSample && i < leftChannel.length; i++) {
      const t = i / this.audioContext!.sampleRate;
      const sample = Math.sin(2 * Math.PI * frequency * t) * bassVolume;
      
      // 低音主要在左声道
      leftChannel[i] += sample * 0.8;
      rightChannel[i] += sample * 0.2;
    }
  }

  // 生成指定配置的音乐
  async generateConfiguredMusic(config: MusicGenerationConfig): Promise<AudioBuffer> {
    return this.generateMusic(config);
  }

  // 获取可用的和弦进行列表
  static getAvailableProgressions(): Array<{key: string, name: string}> {
    return Object.entries(MusicGenerator.CHORD_PROGRESSIONS).map(([key, progression]) => ({
      key: key.toLowerCase().replace('_', '-'),
      name: progression.name
    }));
  }

  async playBuffer(buffer: AudioBuffer, volume: number = 1.0): Promise<void> {
    console.log('🎵 [MusicGenerator] 开始播放音频缓冲区');
    await this.ensureContext(); // 播放前确保 context 可用

    if (!this.audioContext) {
      console.error('❌ [MusicGenerator] AudioContext not available.');
      return;
    }
    console.log('🎵 [MusicGenerator] AudioContext状态:', this.audioContext.state);

    this.stop(); // 停止任何正在播放的音频

    const source = this.audioContext.createBufferSource();
    this.currentSource = source;
    source.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    this.gainNode = gainNode;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    return new Promise((resolve, reject) => {
      source.onended = () => {
        console.log('🎵 [MusicGenerator] 音频播放结束');
        resolve();
      };
      try {
        console.log('🎵 [MusicGenerator] 开始播放音频源');
        source.start(0);
        console.log('🎵 [MusicGenerator] 音频源播放成功');
        resolve();
      } catch (error) {
        console.error('❌ [MusicGenerator] 播放音频缓冲区失败:', error);
        reject(error);
      }
    });
  }

  stop() {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource.disconnect();
      this.currentSource = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  // 向后兼容的方法
  async generateHappyBackgroundMusic(): Promise<AudioBuffer> {
    await getAudioGenerator().initialize();
    return this.generateMusic({ chordProgression: 'happy', duration: 8 });
  }
}

// 导出函数用于向后兼容
export async function generateHappyBackgroundMusicBase64(): Promise<string> {
  const audioGenerator = getAudioGenerator();
  await audioGenerator.initialize();
  
  const musicGenerator = new MusicGenerator();
  const buffer = await musicGenerator.generateHappyBackgroundMusic();
  
  // 这里需要将AudioBuffer转换为base64，但这需要更复杂的实现
  // 暂时返回一个占位符
  return 'data:audio/wav;base64,placeholder';
} 