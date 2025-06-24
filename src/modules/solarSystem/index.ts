/**
 * 太阳系模块主导出文件
 */

// 组件导出
export { default as SolarSystemViewer } from './components/SolarSystemViewer/SolarSystemViewer';
export { default as SolarSystemPage } from './pages/SolarSystemPage';

// 工具函数导出
export * from './utils/planetData';
export * from './utils/astronomyUtils';

// 类型导出
export * from './types';

// 默认导出页面组件
export { default } from './pages/SolarSystemPage'; 