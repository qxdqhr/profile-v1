/**
 * 购买游戏模块数据库Schema
 */

import { pgTable, text, integer, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { ProductType } from '../types';

// 将枚举值转换为字符串数组
const PRODUCT_TYPE_VALUES = Object.values(ProductType) as [string, ...string[]];

// ===== 游戏记录表 =====
export const gameRecords = pgTable('purchase_game_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id'), // 用户ID，可选
  startTime: timestamp('start_time').notNull().defaultNow(),
  endTime: timestamp('end_time'), // 游戏结束时间
  finalScore: integer('final_score').notNull().default(0),
  totalPurchases: integer('total_purchases').notNull().default(0),
  gameDuration: integer('game_duration').notNull().default(0), // 游戏持续时间（秒）
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ===== 购买记录表 =====
export const purchaseRecords = pgTable('purchase_game_purchase_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => gameRecords.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  productType: text('product_type', { enum: PRODUCT_TYPE_VALUES }).notNull(),
  value: integer('value').notNull(),
  score: integer('score').notNull().default(0),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ===== 游戏配置表 =====
export const gameConfigs = pgTable('purchase_game_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ===== 商品配置表 =====
export const productConfigs = pgTable('purchase_game_product_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: text('product_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type', { enum: PRODUCT_TYPE_VALUES }).notNull(),
  minValue: integer('min_value').notNull(),
  maxValue: integer('max_value').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').notNull().default(true),
  weight: integer('weight').notNull().default(1), // 权重，用于随机选择
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ===== 关系定义 =====
export const gameRecordsRelations = relations(gameRecords, ({ many }) => ({
  purchaseRecords: many(purchaseRecords),
}));

export const purchaseRecordsRelations = relations(purchaseRecords, ({ one }) => ({
  gameRecord: one(gameRecords, {
    fields: [purchaseRecords.gameId],
    references: [gameRecords.id],
  }),
}));

// ===== 类型导出 =====
export type GameRecord = typeof gameRecords.$inferSelect;
export type NewGameRecord = typeof gameRecords.$inferInsert;
export type PurchaseRecord = typeof purchaseRecords.$inferSelect;
export type NewPurchaseRecord = typeof purchaseRecords.$inferInsert;
export type GameConfig = typeof gameConfigs.$inferSelect;
export type NewGameConfig = typeof gameConfigs.$inferInsert;
export type ProductConfig = typeof productConfigs.$inferSelect;
export type NewProductConfig = typeof productConfigs.$inferInsert; 