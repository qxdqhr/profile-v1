/**
 * Better Auth 1.7+ 要求 account.issuer；sa2kit 3.9.4 schema 尚未包含，profile-v1 在此扩展。
 * @see createLocalAccountIssuer('credential') => 'local:credential'
 */
import { relations, sql } from 'drizzle-orm';
import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/** credential 账号固定 issuer（与 Better Auth 1.7 createLocalAccountIssuer 一致） */
export const CREDENTIAL_ACCOUNT_ISSUER = 'local:credential';

export const userRole = pgEnum('UserRole', ['USER', 'ADMIN', 'SUPER_ADMIN']);

export const user = pgTable('user', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  emailVerified: boolean('emailVerified').default(false).notNull(),
  image: text('image'),
  phoneNumber: text('phoneNumber'),
  phoneNumberVerified: boolean('phoneNumberVerified').default(false),
  role: userRole('role').default('USER').notNull(),
  createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey().notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  expiresAt: timestamp('expiresAt', { precision: 3, mode: 'date' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const account = pgTable('account', {
  id: text('id').primaryKey().notNull(),
  /** Better Auth 1.7+ 账号命名空间（credential => local:credential） */
  issuer: text('issuer').notNull().default(CREDENTIAL_ACCOUNT_ISSUER),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { precision: 3, mode: 'date' }),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { precision: 3, mode: 'date' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey().notNull(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt', { precision: 3, mode: 'date' }).notNull(),
  createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const verifications = verification;

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const authDrizzleSchema = {
  user,
  session,
  account,
  verification,
  userRelations,
  sessionRelations,
  accountRelations,
};

export type UserRole = (typeof userRole.enumValues)[number];
