import { relations } from 'drizzle-orm';
import { serial, text, timestamp, pgTable, json, integer, primaryKey } from 'drizzle-orm/pg-core';

// 导出画集相关的表
export * from '@/modules/showmasterpiece/db/schema/masterpieces';
// 导出认证相关的表
export * from '@/modules/auth/db/schema';

export * from '@/modules/showmasterpiece/db/schema/masterpieces';

export * from '@/modules/filetransfer/db/schema';

// 导出日历相关的表
export * from '@/modules/calendar/db/schema';

// 导出想法清单相关的表
export * from '@/modules/ideaList/db/schema';

// 导出MMD相关的表
export * from '@/modules/mmd/db/schema';

// 导出名片制作器相关的表
export * from '@/modules/cardMaker/db/schema';

// 导出Mikutap相关的表
export * from '@/modules/mikutap/db/schema';

// 导出通用文件服务相关的表
export * from '@/services/universalFile/db/schema';

// 考试类型表
export const examTypes = pgTable('exam_types', {
  id: text('id').primaryKey(), // 如 "default", "arknights"
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 考试元数据表
export const examMetadata = pgTable('exam_metadata', {
  id: text('id').primaryKey(), // 与考试类型ID相同
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull(),
  lastModified: timestamp('last_modified').notNull(),
});

// 考题表
export const examQuestions = pgTable('exam_questions', {
  id: serial('id').primaryKey(),
  examTypeId: text('exam_type_id').notNull().references(() => examTypes.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull(), // 原始JSON中的问题ID
  content: text('content').notNull(),
  type: text('type').notNull(), // single_choice, multiple_choice, etc.
  options: json('options').notNull(), // 存储选项数组
  answer: text('answer'), // 单选题答案
  answers: json('answers'), // 多选题答案
  score: integer('score').notNull(),
  audioUrl: text('audio_url'), // 题目音频URL
  specialEffect: json('special_effect'), // 存储特殊效果
});

// 启动页配置表
export const examStartScreens = pgTable('exam_start_screens', {
  id: text('id').primaryKey(), // 与考试类型ID相同
  title: text('title').notNull(),
  description: text('description').notNull(),
  rules: json('rules').notNull(), // { title: string, items: string[] }
  buttonText: text('button_text').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 结果页配置表
export const examResultModals = pgTable('exam_result_modals', {
  id: text('id').primaryKey(), // 与考试类型ID相同
  title: text('title').notNull(),
  showDelayTime: integer('show_delay_time').notNull(),
  messages: json('messages').notNull(), // { pass: string, fail: string }
  buttonText: text('button_text').notNull(),
  passingScore: integer('passing_score').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 定义关系
export const examTypesRelations = relations(examTypes, ({ one }) => ({
  metadata: one(examMetadata, {
    fields: [examTypes.id],
    references: [examMetadata.id],
  }),
  startScreen: one(examStartScreens, {
    fields: [examTypes.id],
    references: [examStartScreens.id],
  }),
  resultModal: one(examResultModals, {
    fields: [examTypes.id],
    references: [examResultModals.id],
  }),
}));

export const examMetadataRelations = relations(examMetadata, ({ one }) => ({
  examType: one(examTypes, {
    fields: [examMetadata.id],
    references: [examTypes.id],
  }),
}));

export const examQuestionsRelations = relations(examQuestions, ({ many }) => ({
  examType: many(examTypes),
}));

export const examStartScreensRelations = relations(examStartScreens, ({ one }) => ({
  examType: one(examTypes, {
    fields: [examStartScreens.id],
    references: [examTypes.id],
  }),
}));

export const examResultModalsRelations = relations(examResultModals, ({ one }) => ({
  examType: one(examTypes, {
    fields: [examResultModals.id],
    references: [examTypes.id],
  }),
})); 