import { pgTable, serial, text, timestamp, boolean, varchar, integer, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '@/modules/auth/db/schema';

/**
 * 想法清单表
 * 用于存储用户创建的各种想法清单
 */
export const ideaLists = pgTable('idea_lists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 20 }).default('blue'), // 清单颜色主题
  order: integer('order').notNull().default(0), // 排序权重
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 想法项目表
 * 存储各个清单中的具体想法项目
 */
export const ideaItems = pgTable('idea_items', {
  id: serial('id').primaryKey(),
  listId: integer('list_id').notNull().references(() => ideaLists.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  isCompleted: boolean('is_completed').notNull().default(false),
  priority: varchar('priority', { length: 10 }).notNull().default('medium'), // high, medium, low
  tags: json('tags').$type<string[]>().default([]), // 标签数组
  order: integer('order').notNull().default(0), // 在清单中的排序
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 定义关系
export const ideaListsRelations = relations(ideaLists, ({ one, many }) => ({
  user: one(users, {
    fields: [ideaLists.userId],
    references: [users.id],
  }),
  items: many(ideaItems),
}));

export const ideaItemsRelations = relations(ideaItems, ({ one }) => ({
  list: one(ideaLists, {
    fields: [ideaItems.listId],
    references: [ideaLists.id],
  }),
})); 