/**
 * Mikutap 音乐互动游戏模块入口文件
 */

// ===== 组件导出 =====

export { default as SimpleMikutapPage } from './pages/SimpleMikutapPage';
export { default as ConfigPage } from './pages/ConfigPage';
export { default as SoundLibraryManager } from './components/SoundLibraryManager';
export { default as MusicGeneratorPage } from './pages/MusicGeneratorPage';
export { default as BackgroundMusicManager } from './components/BackgroundMusicManager';


// ===== 工具导出 =====
export { 
  getAudioGenerator, 
  AudioGenerator 
} from './utils/audioGenerator';

// ===== 服务导出 =====
export {
  resetToDefaultConfig,
  updateGridSize,
  updateGridCell,
  generateDefaultCells
} from './services/configService';

// ===== 类型导出 =====
export * from './types';


// ===== 模块信息 =====
export const MIKUTAP_MODULE_VERSION = '1.2.0';
export const MIKUTAP_MODULE_NAME = '@profile-v1/mikutap';