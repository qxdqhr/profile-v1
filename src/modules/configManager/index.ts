// ===== 客户端导出 =====
// 这些可以在客户端使用（React组件、hooks等）

export { ConfigManagerPage } from './pages/ConfigManagerPage';
export { ConfigManagerPageWithAuth } from './pages/ConfigManagerPageWithAuth';
export { ConfigCategoryList } from './components/ConfigCategoryList';
export { ConfigItemList } from './components/ConfigItemList';
export { ConfigItemForm } from './components/ConfigItemForm';
export { ConfigCategoryForm } from './components/ConfigCategoryForm';
export { EnvConfigManager } from './components/EnvConfigManager';
export { UserInfoBar } from './components/UserInfoBar';
export { PermissionGuard } from './components/PermissionGuard';

// 重新导出类型，方便客户端使用
export type {
  ConfigCategory,
  ConfigItem,
  ConfigHistory,
  ConfigPermission,
  ConfigItemType,
  ConfigValidation,
  ConfigItemFormData,
  ConfigCategoryFormData,
  ConfigApiResponse,
  PaginatedResponse,
  PermissionResult,
  ConfigUpdateRequest,
  ConfigBatchUpdateRequest,
  ConfigSearchParams,
} from './types'; 