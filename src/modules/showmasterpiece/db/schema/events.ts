/**
 * ShowMasterpiece 模块 - 活动管理数据库表结构
 * 
 * 这个文件定义了多期活动管理的数据库表结构，使用Drizzle ORM框架。
 * 支持活动的创建、管理和数据隔离。
 * 
 * @fileoverview 活动管理数据库schema
 */

import { relations } from 'drizzle-orm';
import { 
  serial, 
  text, 
  timestamp, 
  pgTable, 
  jsonb, 
  integer, 
  boolean,
  varchar,
  index
} from 'drizzle-orm/pg-core';

/**
 * 活动主表 (showmaster_events)
 * 
 * 存储ShowMasterpiece模块的多期活动信息。
 * 每期活动都有独立的配置和数据空间。
 * 
 * 主要功能：
 * - 活动基本信息管理
 * - 活动状态控制（草稿、进行中、已结束）
 * - 活动时间管理
 * - 活动特定配置存储
 */
export const showmasterEvents = pgTable('showmaster_events', {
  /** 主键ID */
  id: serial('id').primaryKey(),
  
  /** 活动名称 */
  name: varchar('name', { length: 255 }).notNull(),
  
  /** 活动标识符(用于URL和API参数) */
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  
  /** 显示名称 */
  displayName: varchar('display_name', { length: 255 }).notNull(),
  
  /** 活动描述 */
  description: text('description'),
  
  /** 活动开始时间 */
  startDate: timestamp('start_date'),
  
  /** 活动结束时间 */
  endDate: timestamp('end_date'),
  
  /** 活动状态：draft(草稿), active(进行中), archived(已结束) */
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  
  /** 是否为默认活动 */
  isDefault: boolean('is_default').notNull().default(false),
  
  /** 排序顺序 */
  sortOrder: integer('sort_order').notNull().default(0),
  
  /** 活动特定配置（JSON格式） */
  config: jsonb('config').$type<{
    /** 主题颜色 */
    themeColor?: string;
    /** 自定义样式 */
    customStyles?: Record<string, any>;
    /** 特殊功能开关 */
    features?: Record<string, boolean>;
    /** 其他配置 */
    [key: string]: any;
  }>(),
  
  /** 创建时间 */
  createdAt: timestamp('created_at').defaultNow().notNull(),
  
  /** 更新时间 */
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  /** 按状态查询的索引 */
  statusIndex: index('events_status_idx').on(table.status),
  
  /** 按排序顺序查询的索引 */
  sortOrderIndex: index('events_sort_order_idx').on(table.sortOrder),
  
  /** 按默认状态查询的索引 */
  isDefaultIndex: index('events_is_default_idx').on(table.isDefault),
  
  /** slug唯一索引 */
  slugUniqueIndex: index('events_slug_unique_idx').on(table.slug),
}));

/**
 * 活动特定配置表 (showmaster_event_configs)
 * 
 * 存储每个活动的特定配置信息，替代原有的全局配置。
 * 每个活动都有独立的配置，支持个性化定制。
 * 
 * 主要功能：
 * - 活动页面标题和描述配置
 * - 显示选项和分页设置
 * - 主题和语言设置
 * - 功能开关控制
 */
export const showmasterEventConfigs = pgTable('showmaster_event_configs', {
  /** 主键ID */
  id: serial('id').primaryKey(),
  
  /** 关联的活动ID（外键，级联删除） */
  eventId: integer('event_id').notNull().references(() => showmasterEvents.id, { onDelete: 'cascade' }),
  
  /** 网站名称 */
  siteName: varchar('site_name', { length: 255 }).notNull().default('画集展览'),
  
  /** 网站描述 */
  siteDescription: text('site_description').default('精美的艺术作品展览'),
  
  /** 首页主标题 */
  heroTitle: varchar('hero_title', { length: 255 }).notNull().default('艺术画集展览'),
  
  /** 首页副标题 */
  heroSubtitle: text('hero_subtitle').default('探索精美的艺术作品，感受创作的魅力'),
  
  /** 每页显示的最大画集数量 */
  maxCollectionsPerPage: integer('max_collections_per_page').notNull().default(9),
  
  /** 是否启用搜索功能 */
  enableSearch: boolean('enable_search').notNull().default(true),
  
  /** 是否启用分类功能 */
  enableCategories: boolean('enable_categories').notNull().default(true),
  
  /** 默认分类（'all'表示显示所有分类） */
  defaultCategory: varchar('default_category', { length: 100 }).notNull().default('all'),
  
  /** 主题模式：light(浅色)、dark(深色)、auto(自动) */
  theme: varchar('theme', { length: 20 }).notNull().default('light'),
  
  /** 界面语言：zh(中文)、en(英文) */
  language: varchar('language', { length: 10 }).notNull().default('zh'),
  
  /** 创建时间 */
  createdAt: timestamp('created_at').defaultNow().notNull(),
  
  /** 更新时间 */
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  /** 每个活动只能有一个配置记录 */
  eventIdUniqueIndex: index('event_configs_event_id_unique_idx').on(table.eventId),
}));

// ===== 关系定义 =====

/**
 * 活动表关系
 * 一个活动可以有一个配置记录和多个画集、分类、标签
 */
export const showmasterEventsRelations = relations(showmasterEvents, ({ one, many }) => ({
  /** 活动配置 */
  config: one(showmasterEventConfigs, {
    fields: [showmasterEvents.id],
    references: [showmasterEventConfigs.eventId],
  }),
}));

/**
 * 活动配置表关系
 * 每个配置记录属于一个活动
 */
export const showmasterEventConfigsRelations = relations(showmasterEventConfigs, ({ one }) => ({
  /** 所属活动 */
  event: one(showmasterEvents, {
    fields: [showmasterEventConfigs.eventId],
    references: [showmasterEvents.id],
  }),
}));

// ===== 类型定义 =====

export type ShowmasterEvent = typeof showmasterEvents.$inferSelect;
export type NewShowmasterEvent = typeof showmasterEvents.$inferInsert;

export type ShowmasterEventConfig = typeof showmasterEventConfigs.$inferSelect;
export type NewShowmasterEventConfig = typeof showmasterEventConfigs.$inferInsert;

// ===== 活动状态枚举 =====

export enum EventStatus {
  /** 草稿状态 - 正在准备中 */
  DRAFT = 'draft',
  /** 进行中 - 正在展示 */
  ACTIVE = 'active',
  /** 已结束 - 已归档 */
  ARCHIVED = 'archived'
}

export type EventStatusType = `${EventStatus}`;
