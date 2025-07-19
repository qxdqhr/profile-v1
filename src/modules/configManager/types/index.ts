import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { configCategories, configItems, configHistory, configPermissions } from '../db/schema';

// 数据库模型类型
export type ConfigCategory = InferSelectModel<typeof configCategories>;
export type ConfigItem = InferSelectModel<typeof configItems>;
export type ConfigHistory = InferSelectModel<typeof configHistory>;
export type ConfigPermission = InferSelectModel<typeof configPermissions>;

// 插入类型
export type NewConfigCategory = InferInsertModel<typeof configCategories>;
export type NewConfigItem = InferInsertModel<typeof configItems>;
export type NewConfigHistory = InferInsertModel<typeof configHistory>;
export type NewConfigPermission = InferInsertModel<typeof configPermissions>;

// 配置项类型
export type ConfigItemType = 'string' | 'number' | 'boolean' | 'json' | 'password';

// 配置验证规则
export interface ConfigValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  enum?: string[];
}

// 配置项表单数据
export interface ConfigItemFormData {
  key: string;
  displayName: string;
  description?: string;
  value: string;
  defaultValue?: string;
  type: ConfigItemType;
  isRequired: boolean;
  isSensitive: boolean;
  validation?: ConfigValidation;
  sortOrder: number;
  categoryId: string;
}

// 配置分类表单数据
export interface ConfigCategoryFormData {
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  sortOrder: number;
}

// API响应类型
export interface ConfigApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 权限检查结果
export interface PermissionResult {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

// 配置更新请求
export interface ConfigUpdateRequest {
  configItemId: string;
  value: string;
  changeReason?: string;
}

// 配置批量更新请求
export interface ConfigBatchUpdateRequest {
  updates: ConfigUpdateRequest[];
}

// 配置搜索参数
export interface ConfigSearchParams {
  categoryId?: string;
  search?: string;
  type?: ConfigItemType;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
} 