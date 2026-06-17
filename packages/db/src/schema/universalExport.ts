/**
 * 通用导出配置数据库表结构
 */

import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const exportConfigs = pgTable('export_configs', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  description: text('description'),
  format: text('format').notNull(),
  fields: jsonb('fields').notNull(),
  fileNameTemplate: text('file_name_template').notNull(),
  includeHeader: boolean('include_header').notNull().default(true),
  delimiter: text('delimiter').notNull().default(','),
  encoding: text('encoding').notNull().default('utf-8'),
  addBOM: boolean('add_bom').notNull().default(true),
  maxRows: integer('max_rows'),
  grouping: jsonb('grouping'),
  moduleId: text('module_id').notNull(),
  businessId: text('business_id'),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const exportHistory = pgTable('export_history', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  configId: text('config_id').notNull().references(() => exportConfigs.id),
  exportId: text('export_id').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  exportedRows: integer('exported_rows').notNull(),
  duration: integer('duration'),
  status: text('status').notNull(),
  error: text('error'),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type ExportConfig = typeof exportConfigs.$inferSelect;
export type NewExportConfig = typeof exportConfigs.$inferInsert;
export type ExportHistory = typeof exportHistory.$inferSelect;
export type NewExportHistory = typeof exportHistory.$inferInsert;
