/**
 * 将 role 为 ADMIN / SUPER_ADMIN 的用户 credential 密码更新为 ADMIN_NEW_PASSWORD。
 * 用法: ADMIN_NEW_PASSWORD='...' pnpm exec tsx --import @profile/config/preload deploy/scripts/db/update-admin-password.ts
 */
import { and, eq, inArray, or } from 'drizzle-orm';
import { hashPassword } from 'better-auth/crypto';
import { nanoid } from 'nanoid';
import { db } from '@profile/db';
import { account, session, user, CREDENTIAL_ACCOUNT_ISSUER } from '@profile/auth/schema';

const pwd = process.env.ADMIN_NEW_PASSWORD?.trim();
if (!pwd || pwd.length < 6) {
  console.error('请设置环境变量 ADMIN_NEW_PASSWORD（至少 6 位，与登录接口一致）');
  process.exit(1);
}

async function main() {
  const passwordHash = await hashPassword(pwd);

  const admins = await db
    .select({ id: user.id, phoneNumber: user.phoneNumber, role: user.role })
    .from(user)
    .where(or(eq(user.role, 'ADMIN'), eq(user.role, 'SUPER_ADMIN')));

  if (admins.length === 0) {
    console.error('未找到 role 为 ADMIN 或 SUPER_ADMIN 的用户，未做任何更新。');
    process.exit(2);
  }

  const ids = admins.map((r) => r.id);
  const now = new Date();

  for (const admin of admins) {
    const [cred] = await db
      .select({ id: account.id })
      .from(account)
      .where(and(eq(account.userId, admin.id), eq(account.providerId, 'credential')))
      .limit(1);

    if (cred) {
      await db
        .update(account)
        .set({
          issuer: CREDENTIAL_ACCOUNT_ISSUER,
          accountId: admin.id,
          password: passwordHash,
          updatedAt: now,
        })
        .where(eq(account.id, cred.id));
    } else {
      await db.insert(account).values({
        id: nanoid(),
        issuer: CREDENTIAL_ACCOUNT_ISSUER,
        accountId: admin.id,
        providerId: 'credential',
        userId: admin.id,
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  await db.delete(session).where(inArray(session.userId, ids));

  console.log('已更新管理员 credential 密码并清除其 session，需重新登录。受影响行数:', admins.length);
  console.table(admins.map((r) => ({ id: r.id, phone: r.phoneNumber, role: r.role })));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
