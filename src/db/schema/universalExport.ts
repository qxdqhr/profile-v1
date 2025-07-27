/**
 * 通用导出配置数据库表结构
 */

import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

/**
 * 导出配置表
 */
export const exportConfigs = pgTable('export_configs', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  description: text('description'),
  format: text('format').notNull(), // 'csv', 'json', 'excel'
  fields: jsonb('fields').notNull(), // ExportField[]
  fileNameTemplate: text('file_name_template').notNull(),
  includeHeader: boolean('include_header').notNull().default(true),
  delimiter: text('delimiter').notNull().default(','),
  encoding: text('encoding').notNull().default('utf-8'),
  addBOM: boolean('add_bom').notNull().default(true),
  maxRows: integer('max_rows'),
  moduleId: text('module_id').notNull(),
  businessId: text('business_id'),
  createdBy: text('created_by'), // 用户ID
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * 导出历史记录表
 */
export const exportHistory = pgTable('export_history', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  configId: text('config_id').notNull().references(() => exportConfigs.id),
  exportId: text('export_id').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  exportedRows: integer('exported_rows').notNull(),
  duration: integer('duration'), // 毫秒
  status: text('status').notNull(), // 'success', 'failed'
  error: text('error'),
  createdBy: text('created_by'), // 用户ID
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type ExportConfig = typeof exportConfigs.$inferSelect;
export type NewExportConfig = typeof exportConfigs.$inferInsert;
export type ExportHistory = typeof exportHistory.$inferSelect;
export type NewExportHistory = typeof exportHistory.$inferInsert; 