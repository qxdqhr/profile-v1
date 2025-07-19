import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

// 配置分类表
export const configCategories = pgTable('config_categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(), // 分类名称
  displayName: text('display_name').notNull(), // 显示名称
  description: text('description'), // 描述
  icon: text('icon'), // 图标
  sortOrder: integer('sort_order').default(0), // 排序
  isActive: boolean('is_active').default(true), // 是否激活
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 配置项表
export const configItems = pgTable('config_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoryId: text('category_id').references(() => configCategories.id), // 分类ID
  key: text('key').notNull(), // 配置键
  displayName: text('display_name').notNull(), // 显示名称
  description: text('description'), // 描述
  value: text('value'), // 配置值
  defaultValue: text('default_value'), // 默认值
  type: text('type').notNull(), // 类型：string, number, boolean, json, password
  isRequired: boolean('is_required').default(false), // 是否必填
  isSensitive: boolean('is_sensitive').default(false), // 是否敏感信息
  validation: jsonb('validation'), // 验证规则
  sortOrder: integer('sort_order').default(0), // 排序
  isActive: boolean('is_active').default(true), // 是否激活
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 配置历史表
export const configHistory = pgTable('config_history', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  configItemId: text('config_item_id').references(() => configItems.id), // 配置项ID
  oldValue: text('old_value'), // 旧值
  newValue: text('new_value'), // 新值
  changedBy: text('changed_by').notNull(), // 修改人
  changeReason: text('change_reason'), // 修改原因
  createdAt: timestamp('created_at').defaultNow(),
});

// 配置权限表
export const configPermissions = pgTable('config_permissions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(), // 用户ID
  categoryId: text('category_id').references(() => configCategories.id), // 分类ID
  canRead: boolean('can_read').default(false), // 可读权限
  canWrite: boolean('can_write').default(false), // 可写权限
  canDelete: boolean('can_delete').default(false), // 可删除权限
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}); 