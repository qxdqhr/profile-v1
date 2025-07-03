import { pgTable, serial, text, timestamp, json, integer, boolean, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Mikutap网格配置表
export const mikutapConfigs = pgTable('mikutap_configs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  rows: integer('rows').notNull().default(6),
  cols: integer('cols').notNull().default(5),
  soundLibrary: json('sound_library'), // 音效库配置
  interfaceSettings: json('interface_settings'), // 界面设置
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Mikutap网格单元格表
export const mikutapGridCells = pgTable('mikutap_grid_cells', {
  id: text('id').primaryKey(),
  configId: text('config_id').notNull().references(() => mikutapConfigs.id, { onDelete: 'cascade' }),
  row: integer('row').notNull(),
  col: integer('col').notNull(),
  key: text('key'), // 键盘按键（可选）
  soundType: text('sound_type').notNull(), // 'piano' | 'drum' | 'synth' | 'bass' | 'lead' | 'pad' | 'fx' | 'vocal' | 'custom'
  soundSource: text('sound_source').notNull(), // 'synthesized' | 'file' | 'url'
  waveType: text('wave_type').notNull(), // 'sine' | 'square' | 'sawtooth' | 'triangle'
  frequency: real('frequency'),
  volume: real('volume'),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  audioFile: text('audio_file'), // 音频文件路径或URL
  effects: json('effects'), // 音效处理参数
  // 动画配置字段
  animationEnabled: boolean('animation_enabled').notNull().default(true),
  animationType: text('animation_type').notNull().default('pulse'), // 'pulse' | 'slide' | 'bounce' | 'flash' | 'custom'
  animationData: json('animation_data'), // 存储Lottie JSON动画数据或自定义动画参数
  animationConfig: json('animation_config'), // 动画配置: { duration, speed, scale, opacity, direction }
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Mikutap音效库表
export const mikutapSoundLibrary = pgTable('mikutap_sound_library', {
  id: text('id').primaryKey(),
  configId: text('config_id').notNull().references(() => mikutapConfigs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  file: text('file').notNull(),
  type: text('type').notNull(), // SoundType
  description: text('description'),
  size: integer('size'),
  duration: real('duration'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Mikutap背景音乐表
export const mikutapBackgroundMusic = pgTable('mikutap_background_music', {
  id: text('id').primaryKey(),
  configId: text('config_id').notNull().references(() => mikutapConfigs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  file: text('file').notNull(), // 存储文件路径或URL，不再存储base64
  fileType: text('file_type').notNull().default('uploaded'), // 'uploaded' | 'generated'
  isDefault: boolean('is_default').notNull().default(false),
  volume: real('volume').notNull().default(0.5),
  loop: boolean('loop').notNull().default(true),
  bpm: integer('bpm').notNull().default(120),
  description: text('description'),
  size: integer('size'),
  duration: real('duration'),
  // 音乐生成配置
  generationConfig: json('generation_config'), // 存储音乐生成参数
  // 节奏配置
  rhythmPattern: json('rhythm_pattern'), // 存储节奏配置
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 定义关系
export const mikutapConfigsRelations = relations(mikutapConfigs, ({ many }) => ({
  cells: many(mikutapGridCells),
  soundLibrary: many(mikutapSoundLibrary),
}));

export const mikutapGridCellsRelations = relations(mikutapGridCells, ({ one }) => ({
  config: one(mikutapConfigs, {
    fields: [mikutapGridCells.configId],
    references: [mikutapConfigs.id],
  }),
}));

export const mikutapSoundLibraryRelations = relations(mikutapSoundLibrary, ({ one }) => ({
  config: one(mikutapConfigs, {
    fields: [mikutapSoundLibrary.configId],
    references: [mikutapConfigs.id],
  }),
})); 