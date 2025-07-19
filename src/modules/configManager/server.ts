// ===== 服务端专用导出 =====
// 这些只能在服务端使用（API路由、服务器组件等）

export { configDbService } from './db/configDbService';

// 重新导出数据库表结构
export {
  configCategories,
  configItems,
  configHistory,
  configPermissions,
} from './db/schema';

// 重新导出类型，方便服务端使用
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