import { and, eq } from 'drizzle-orm';
import { hashPassword } from 'better-auth/crypto';
import { nanoid } from 'nanoid';
import { db } from '@profile/db';
import {
  account,
  CREDENTIAL_ACCOUNT_ISSUER,
} from '@profile/db/schema/auth';

type Database = typeof db;

/** 为手机号注册用户写入 credential 密码（含 Better Auth 1.7 issuer） */
export async function upsertCredentialPassword(
  database: Database,
  userId: string,
  password: string,
) {
  const now = new Date();
  const passwordHash = await hashPassword(password);

  const [existing] = await database
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, 'credential')))
    .limit(1);

  if (existing) {
    await database
      .update(account)
      .set({
        issuer: CREDENTIAL_ACCOUNT_ISSUER,
        accountId: userId,
        password: passwordHash,
        updatedAt: now,
      })
      .where(eq(account.id, existing.id));
    return;
  }

  await database.insert(account).values({
    id: nanoid(),
    issuer: CREDENTIAL_ACCOUNT_ISSUER,
    accountId: userId,
    providerId: 'credential',
    userId,
    password: passwordHash,
    createdAt: now,
    updatedAt: now,
  });
}
