// ===== 客户端导出 =====
// 这些可以在客户端使用（React组件、hooks等）

export { ConfigManagerPage } from './pages/ConfigManagerPage';
export { ConfigManagerPageWithAuth } from './pages/ConfigManagerPageWithAuth';
export { SimpleConfigManager } from './components/SimpleConfigManager';
export { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
export { AddConfigItemDialog } from './components/AddConfigItemDialog';
export { EnvConfigManager } from './components/EnvConfigManager';

// ===== 服务端导出 =====
// 这些只能在服务端使用（数据库服务、API等）

export { configDbService } from './db/configDbService';
export { EnvConfigService } from './services/envConfigService';

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