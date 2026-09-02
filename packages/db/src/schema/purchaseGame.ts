/**
 * 购买游戏（purchase-game）表结构
 * 模块已迁 Godot 旁路；schema 保留在 @profile/db 供 Drizzle 与既有迁移对齐。
 */

import { pgTable, text, integer, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

const PRODUCT_TYPE_VALUES = ['money', 'life'] as [string, ...string[]];

export const gameRecords = pgTable('purchase_game_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id'),
  startTime: timestamp('start_time').notNull().defaultNow(),
  endTime: timestamp('end_time'),
  finalScore: integer('final_score').notNull().default(0),
  totalPurchases: integer('total_purchases').notNull().default(0),
  gameDuration: integer('game_duration').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

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

export const gameConfigs = pgTable('purchase_game_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

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
  weight: integer('weight').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const gameRecordsRelations = relations(gameRecords, ({ many }) => ({
  purchaseRecords: many(purchaseRecords),
}));

export const purchaseRecordsRelations = relations(purchaseRecords, ({ one }) => ({
  gameRecord: one(gameRecords, {
    fields: [purchaseRecords.gameId],
    references: [gameRecords.id],
  }),
}));

export type GameRecord = typeof gameRecords.$inferSelect;
export type NewGameRecord = typeof gameRecords.$inferInsert;
export type PurchaseRecord = typeof purchaseRecords.$inferSelect;
export type NewPurchaseRecord = typeof purchaseRecords.$inferInsert;
export type GameConfig = typeof gameConfigs.$inferSelect;
export type NewGameConfig = typeof gameConfigs.$inferInsert;
export type ProductConfig = typeof productConfigs.$inferSelect;
export type NewProductConfig = typeof productConfigs.$inferInsert;
