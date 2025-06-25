/**
 * Mikutap 音乐互动游戏模块入口文件
 */

// ===== 组件导出 =====

export { default as SimpleMikutapPage } from './pages/SimpleMikutapPage';


// ===== 工具导出 =====
export { 
  getAudioGenerator, 
  AudioGenerator 
} from './utils/audioGenerator';

// ===== 类型导出 =====
// 类型定义已内嵌在组件中


// ===== 模块信息 =====
export const MIKUTAP_MODULE_VERSION = '1.0.0';
export const MIKUTAP_MODULE_NAME = '@profile-v1/mikutap';