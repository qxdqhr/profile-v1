/**
 * ShowMasterpiece 模块 - 购物车数据库表结构
 * 
 * 定义购物车相关的数据库表结构，包括：
 * - 购物车表
 * - 购物车项表
 * 
 * @fileoverview 购物车数据库表结构
 */

import { pgTable, serial, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { comicUniverseCollections } from '@/db/schema';

/**
 * 购物车表
 * 
 * 存储用户的购物车基本信息
 */
export const comicUniverseCarts = pgTable('comic_universe_carts', {
  /** 购物车ID */
  id: serial('id').primaryKey(),
  
  /** 用户ID（关联用户表） */
  userId: integer('user_id').notNull(),
  
  /** 购物车状态：active-活跃，abandoned-已放弃，converted-已转换 */
  status: text('status', { enum: ['active', 'abandoned', 'converted'] }).notNull().default('active'),
  
  /** 是否已过期 */
  isExpired: boolean('is_expired').notNull().default(false),
  
  /** 过期时间 */
  expiresAt: timestamp('expires_at'),
  
  /** 创建时间 */
  createdAt: timestamp('created_at').notNull().defaultNow(),
  
  /** 更新时间 */
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * 购物车项表
 * 
 * 存储购物车中的具体商品项
 */
export const comicUniverseCartItems = pgTable('comic_universe_cart_items', {
  /** 购物车项ID */
  id: serial('id').primaryKey(),
  
  /** 购物车ID（关联购物车表） */
  cartId: integer('cart_id').notNull().references(() => comicUniverseCarts.id, { onDelete: 'cascade' }),
  
  /** 画集ID（关联画集表） */
  collectionId: integer('collection_id').notNull().references(() => comicUniverseCollections.id, { onDelete: 'cascade' }),
  
  /** 商品数量 */
  quantity: integer('quantity').notNull().default(1),
  
  /** 添加时间 */
  addedAt: timestamp('added_at').notNull().defaultNow(),
  
  /** 更新时间 */
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * 购物车表类型定义
 */
export type ComicUniverseCart = typeof comicUniverseCarts.$inferSelect;
export type NewComicUniverseCart = typeof comicUniverseCarts.$inferInsert;

/**
 * 购物车项表类型定义
 */
export type ComicUniverseCartItem = typeof comicUniverseCartItems.$inferSelect;
export type NewComicUniverseCartItem = typeof comicUniverseCartItems.$inferInsert; 