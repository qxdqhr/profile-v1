/**
 * 薄兼容层（Phase H∞）：MMD 资源 CRUD 已迁 sa2kit/business/mmd/server。
 * 播放器 UI 仍走 sa2kit/business/mmd；宿主 Three 死壳已删，OPT-01 另议。
 */
export type {
  MMDModel,
  MMDAnimation,
  MMDAudio,
  MMDScene,
  ApiResponse,
} from 'sa2kit/business/mmd/server';
