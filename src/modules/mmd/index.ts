/**
 * MMD (MikuMikuDance) 模块 - 简化版本
 * 
 * 专注于核心功能：
 * - MMD模型文件解析和显示
 * - 本地文件导入流程
 * - 3D场景渲染
 */

// ===== 核心组件导出 =====
export { MMDViewer } from './components/MMDViewer';
export { default as MMDViewerPage } from './pages/MMDViewerPage';

// ===== 工具函数导出 =====
export { createMMDScene, updateCameraAspect, updateRendererSize, disposeObject } from './utils/sceneUtils';
export { MMDModelBuilder } from './utils/mmdModelBuilder';

// ===== 类型导出 =====
export type { MMDViewerProps } from './types';

// ===== MMD解析器 =====
export { MMDParser } from 'mmd-parser';

/**
 * 简单的MMD文件解析工具函数
 */
export async function parseMMDFile(file: File): Promise<any> {
  const arrayBuffer = await file.arrayBuffer();
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.pmx')) {
    const { MMDParser } = await import('mmd-parser');
    return MMDParser.parsePmx(arrayBuffer);
  } else if (fileName.endsWith('.pmd')) {
    const { MMDParser } = await import('mmd-parser');
    return MMDParser.parsePmd(arrayBuffer);
  } else {
    throw new Error('不支持的文件格式，仅支持 .pmd 和 .pmx 文件');
  }
}

/** 模块版本 */
export const MMD_MODULE_VERSION = '1.0.0'; 