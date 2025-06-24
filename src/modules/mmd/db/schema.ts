import { pgTable, serial, text, timestamp, boolean, varchar, integer, real, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../../auth/db/schema';

/**
 * MMD模型表
 */
export const mmdModels = pgTable('mmd_models', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  thumbnailPath: varchar('thumbnail_path', { length: 500 }),
  fileSize: integer('file_size').notNull(), // 文件大小(bytes)
  format: varchar('format', { length: 10 }).notNull(), // 'pmd' | 'pmx'
  uploadTime: timestamp('upload_time').defaultNow().notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  tags: json('tags').$type<string[]>(), // 标签数组
  isPublic: boolean('is_public').notNull().default(false),
  downloadCount: integer('download_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * MMD动画表
 */
export const mmdAnimations = pgTable('mmd_animations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  fileSize: integer('file_size').notNull(), // 文件大小(bytes)
  duration: real('duration').notNull(), // 动画时长(秒)
  frameCount: integer('frame_count').notNull(), // 帧数
  uploadTime: timestamp('upload_time').defaultNow().notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  tags: json('tags').$type<string[]>(), // 标签数组
  isPublic: boolean('is_public').notNull().default(false),
  compatibleModels: json('compatible_models').$type<string[]>(), // 兼容的模型ID列表
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * MMD音频表
 */
export const mmdAudios = pgTable('mmd_audios', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  fileSize: integer('file_size').notNull(), // 文件大小(bytes)
  duration: real('duration').notNull(), // 音频时长(秒)
  format: varchar('format', { length: 10 }).notNull(), // 'wav' | 'mp3' | 'ogg'
  uploadTime: timestamp('upload_time').defaultNow().notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * MMD场景表
 */
export const mmdScenes = pgTable('mmd_scenes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  modelId: integer('model_id').notNull().references(() => mmdModels.id, { onDelete: 'cascade' }),
  animationId: integer('animation_id').references(() => mmdAnimations.id, { onDelete: 'set null' }),
  audioId: integer('audio_id').references(() => mmdAudios.id, { onDelete: 'set null' }),
  // 相机配置 - 使用JSON存储复杂对象
  cameraPosition: json('camera_position').$type<{ x: number; y: number; z: number }>().notNull(),
  cameraTarget: json('camera_target').$type<{ x: number; y: number; z: number }>().notNull(),
  // 光照配置
  lighting: json('lighting').$type<{
    ambientLight: {
      color: string;
      intensity: number;
    };
    directionalLight: {
      color: string;
      intensity: number;
      position: { x: number; y: number; z: number };
    };
  }>().notNull(),
  // 背景配置
  background: json('background').$type<{
    type: 'color' | 'image' | 'skybox';
    value: string;
  }>().notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * MMD模型收藏表 - 用户可以收藏喜欢的模型
 */
export const mmdModelFavorites = pgTable('mmd_model_favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  modelId: integer('model_id').notNull().references(() => mmdModels.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * MMD动画收藏表 - 用户可以收藏喜欢的动画
 */
export const mmdAnimationFavorites = pgTable('mmd_animation_favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  animationId: integer('animation_id').notNull().references(() => mmdAnimations.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===== 关系定义 =====

export const mmdModelsRelations = relations(mmdModels, ({ one, many }) => ({
  user: one(users, {
    fields: [mmdModels.userId],
    references: [users.id],
  }),
  scenes: many(mmdScenes),
  favorites: many(mmdModelFavorites),
}));

export const mmdAnimationsRelations = relations(mmdAnimations, ({ one, many }) => ({
  user: one(users, {
    fields: [mmdAnimations.userId],
    references: [users.id],
  }),
  scenes: many(mmdScenes),
  favorites: many(mmdAnimationFavorites),
}));

export const mmdAudiosRelations = relations(mmdAudios, ({ one, many }) => ({
  user: one(users, {
    fields: [mmdAudios.userId],
    references: [users.id],
  }),
  scenes: many(mmdScenes),
}));

export const mmdScenesRelations = relations(mmdScenes, ({ one }) => ({
  user: one(users, {
    fields: [mmdScenes.userId],
    references: [users.id],
  }),
  model: one(mmdModels, {
    fields: [mmdScenes.modelId],
    references: [mmdModels.id],
  }),
  animation: one(mmdAnimations, {
    fields: [mmdScenes.animationId],
    references: [mmdAnimations.id],
  }),
  audio: one(mmdAudios, {
    fields: [mmdScenes.audioId],
    references: [mmdAudios.id],
  }),
}));

export const mmdModelFavoritesRelations = relations(mmdModelFavorites, ({ one }) => ({
  user: one(users, {
    fields: [mmdModelFavorites.userId],
    references: [users.id],
  }),
  model: one(mmdModels, {
    fields: [mmdModelFavorites.modelId],
    references: [mmdModels.id],
  }),
}));

export const mmdAnimationFavoritesRelations = relations(mmdAnimationFavorites, ({ one }) => ({
  user: one(users, {
    fields: [mmdAnimationFavorites.userId],
    references: [users.id],
  }),
  animation: one(mmdAnimations, {
    fields: [mmdAnimationFavorites.animationId],
    references: [mmdAnimations.id],
  }),
})); 