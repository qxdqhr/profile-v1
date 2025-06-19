/**
 * 实验田模块入口文件
 */

// 导出类型
export type {
  ExperimentItem,
  ExperimentCategory,
  ViewMode,
  CompletionFilter,
  TestFieldConfig,
  TestFieldPageProps
} from './types';

// 导出组件
export { default as TestFieldPage } from './pages/TestFieldPage';

// 导出工具函数
export {
  filterExperiments,
  sortExperiments,
  getAllTags,
  getExperimentCounts,
  validateExperiment,
  getCategoryDisplayName,
  getCategoryColor,
  getCompletionFilterDisplayName,
  getCompletionStatusColor,
  getCompletionStatusText
} from './utils';

// 导出数据
export { experiments } from './utils/experimentData';