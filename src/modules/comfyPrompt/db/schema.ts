import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  json,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '@/lib/auth/schema';

export const comfyPromptGroups = pgTable('comfy_prompt_groups', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 20 }).default('violet'),
  kind: varchar('kind', { length: 20 }).notNull().default('positive'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const comfyPrompts = pgTable('comfy_prompts', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  groupId: integer('group_id').references(() => comfyPromptGroups.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  kind: varchar('kind', { length: 20 }).notNull().default('positive'),
  tags: json('tags').$type<string[]>().default([]),
  weight: numeric('weight', { precision: 4, scale: 2 }),
  order: integer('order').notNull().default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const comfyPromptSets = pgTable('comfy_prompt_sets', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 120 }).notNull(),
  description: text('description'),
  kind: varchar('kind', { length: 20 }).notNull().default('positive'),
  separator: varchar('separator', { length: 20 }).notNull().default(', '),
  tags: json('tags').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const comfyPromptSetItems = pgTable('comfy_prompt_set_items', {
  id: serial('id').primaryKey(),
  setId: integer('set_id')
    .notNull()
    .references(() => comfyPromptSets.id, { onDelete: 'cascade' }),
  promptId: integer('prompt_id')
    .notNull()
    .references(() => comfyPrompts.id, { onDelete: 'cascade' }),
  order: integer('order').notNull().default(0),
  enabled: boolean('enabled').notNull().default(true),
  customPrefix: text('custom_prefix'),
  customSuffix: text('custom_suffix'),
});

export const comfyWorkflows = pgTable('comfy_workflows', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  workflowJson: json('workflow_json').$type<Record<string, unknown>>().notNull(),
  tags: json('tags').$type<string[]>().default([]),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const comfyPromptGroupsRelations = relations(comfyPromptGroups, ({ one, many }) => ({
  user: one(users, { fields: [comfyPromptGroups.userId], references: [users.id] }),
  prompts: many(comfyPrompts),
}));

export const comfyPromptsRelations = relations(comfyPrompts, ({ one, many }) => ({
  user: one(users, { fields: [comfyPrompts.userId], references: [users.id] }),
  group: one(comfyPromptGroups, { fields: [comfyPrompts.groupId], references: [comfyPromptGroups.id] }),
  setItems: many(comfyPromptSetItems),
}));

export const comfyPromptSetsRelations = relations(comfyPromptSets, ({ one, many }) => ({
  user: one(users, { fields: [comfyPromptSets.userId], references: [users.id] }),
  items: many(comfyPromptSetItems),
}));

export const comfyPromptSetItemsRelations = relations(comfyPromptSetItems, ({ one }) => ({
  set: one(comfyPromptSets, { fields: [comfyPromptSetItems.setId], references: [comfyPromptSets.id] }),
  prompt: one(comfyPrompts, { fields: [comfyPromptSetItems.promptId], references: [comfyPrompts.id] }),
}));

export const comfyWorkflowsRelations = relations(comfyWorkflows, ({ one }) => ({
  user: one(users, { fields: [comfyWorkflows.userId], references: [users.id] }),
}));
