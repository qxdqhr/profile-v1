import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

/**
 * 验证码表
 */
export const verificationCodes = pgTable('verification_codes', {
  id: serial('id').primaryKey(),
  phone: text('phone').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  used: boolean('used').default(false).notNull(),
}); 