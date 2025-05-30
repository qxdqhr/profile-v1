import { relations } from 'drizzle-orm';
import { 
  serial, 
  text, 
  timestamp, 
  pgTable, 
  json, 
  integer, 
  boolean,
  varchar
} from 'drizzle-orm/pg-core';

// 画廊配置表
export const comicUniverseConfigs = pgTable('comic_universe_configs', {
  id: serial('id').primaryKey(),
  siteName: varchar('site_name', { length: 255 }).notNull().default('画集展览'),
  siteDescription: text('site_description').default('精美的艺术作品展览'),
  heroTitle: varchar('hero_title', { length: 255 }).notNull().default('艺术画集展览'),
  heroSubtitle: text('hero_subtitle').default('探索精美的艺术作品，感受创作的魅力'),
  maxCollectionsPerPage: integer('max_collections_per_page').notNull().default(9),
  enableSearch: boolean('enable_search').notNull().default(true),
  enableCategories: boolean('enable_categories').notNull().default(true),
  defaultCategory: varchar('default_category', { length: 100 }).notNull().default('all'),
  theme: varchar('theme', { length: 20 }).notNull().default('light'), // light, dark, auto
  language: varchar('language', { length: 10 }).notNull().default('zh'), // zh, en
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 画集分类表
export const comicUniverseCategories = pgTable('comic_universe_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 标签表
export const comicUniverseTags = pgTable('comic_universe_tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  color: varchar('color', { length: 7 }).default('#3b82f6'), // 十六进制颜色值
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 画集表
export const comicUniverseCollections = pgTable('comic_universe_collections', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  artist: varchar('artist', { length: 255 }).notNull(),
  coverImage: text('cover_image').notNull(), // 支持URL或base64
  description: text('description'),
  categoryId: integer('category_id').references(() => comicUniverseCategories.id, { onDelete: 'set null' }),
  isPublished: boolean('is_published').notNull().default(true),
  publishedAt: timestamp('published_at'),
  displayOrder: integer('display_order').default(0),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 画集标签关联表（多对多关系）
export const comicUniverseCollectionTags = pgTable('comic_universe_collection_tags', {
  collectionId: integer('collection_id').notNull().references(() => comicUniverseCollections.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => comicUniverseTags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: { primaryKey: [table.collectionId, table.tagId] }
}));

// 作品页面表
export const comicUniverseArtworks = pgTable('comic_universe_artworks', {
  id: serial('id').primaryKey(),
  collectionId: integer('collection_id').notNull().references(() => comicUniverseCollections.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  artist: varchar('artist', { length: 255 }).notNull(),
  image: text('image').notNull(), // 支持URL或base64
  description: text('description'),
  createdTime: varchar('created_time', { length: 20 }), // 创作时间
  theme: varchar('theme', { length: 255 }), // 主题
  dimensions: varchar('dimensions', { length: 100 }), // 尺寸
  pageOrder: integer('page_order').notNull().default(0), // 在画集中的顺序
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 定义关系
export const comicUniverseConfigsRelations = relations(comicUniverseConfigs, ({ many }) => ({
  // 配置表通常只有一条记录，不需要关系
}));

export const comicUniverseCategoriesRelations = relations(comicUniverseCategories, ({ many }) => ({
  collections: many(comicUniverseCollections),
}));

export const comicUniverseTagsRelations = relations(comicUniverseTags, ({ many }) => ({
  collectionTags: many(comicUniverseCollectionTags),
}));

export const comicUniverseCollectionsRelations = relations(comicUniverseCollections, ({ one, many }) => ({
  category: one(comicUniverseCategories, {
    fields: [comicUniverseCollections.categoryId],
    references: [comicUniverseCategories.id],
  }),
  artworks: many(comicUniverseArtworks),
  collectionTags: many(comicUniverseCollectionTags),
}));

export const comicUniverseCollectionTagsRelations = relations(comicUniverseCollectionTags, ({ one }) => ({
  collection: one(comicUniverseCollections, {
    fields: [comicUniverseCollectionTags.collectionId],
    references: [comicUniverseCollections.id],
  }),
  tag: one(comicUniverseTags, {
    fields: [comicUniverseCollectionTags.tagId],
    references: [comicUniverseTags.id],
  }),
}));

export const comicUniverseArtworksRelations = relations(comicUniverseArtworks, ({ one }) => ({
  collection: one(comicUniverseCollections, {
    fields: [comicUniverseArtworks.collectionId],
    references: [comicUniverseCollections.id],
  }),
})); 