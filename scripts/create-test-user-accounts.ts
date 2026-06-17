/**
 * 创建/更新预设测试账号（Better Auth 3.0：user + account 表）
 * 用法:
 *   pnpm devdb:createusers
 *   pnpm prodb:createusers
 */
import { and, eq } from 'drizzle-orm';
import { hashPassword } from 'better-auth/crypto';
import { nanoid } from 'nanoid';
import { db } from '@profile/db';
import { account, user } from '@profile/auth/schema';
import type { UserRole } from 'sa2kit/common/auth/schema';

type TestAccount = {
  phoneNumber: string;
  password: string;
  name: string;
  role: UserRole;
};

const TEST_ACCOUNTS: TestAccount[] = [
  {
    phoneNumber: '13800138000',
    password: 'admin123456',
    name: '系统管理员',
    role: 'ADMIN',
  },
  {
    phoneNumber: '13900139000',
    password: 'test123456',
    name: '测试用户',
    role: 'USER',
  },
  {
    phoneNumber: '13700137000',
    password: 'demo123456',
    name: '演示用户',
    role: 'USER',
  },
];

function emailFromPhone(phoneNumber: string): string {
  return `${phoneNumber.replace(/\D/g, '')}@phone.sa2kit.local`;
}

async function upsertTestAccount(spec: TestAccount) {
  const now = new Date();
  const email = emailFromPhone(spec.phoneNumber);
  const passwordHash = await hashPassword(spec.password);

  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.phoneNumber, spec.phoneNumber))
    .limit(1);

  let userId = existing?.id;

  if (userId) {
    await db
      .update(user)
      .set({
        name: spec.name,
        email,
        role: spec.role,
        phoneNumberVerified: true,
        updatedAt: now,
      })
      .where(eq(user.id, userId));
  } else {
    userId = nanoid();
    await db.insert(user).values({
      id: userId,
      name: spec.name,
      email,
      emailVerified: false,
      phoneNumber: spec.phoneNumber,
      phoneNumberVerified: true,
      role: spec.role,
      createdAt: now,
      updatedAt: now,
    });
  }

  const [credentialAccount] = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, 'credential')))
    .limit(1);

  if (credentialAccount) {
    await db
      .update(account)
      .set({
        password: passwordHash,
        updatedAt: now,
      })
      .where(eq(account.id, credentialAccount.id));
  } else {
    await db.insert(account).values({
      id: nanoid(),
      accountId: userId,
      providerId: 'credential',
      userId,
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  }

  return {
    id: userId,
    phoneNumber: spec.phoneNumber,
    name: spec.name,
    role: spec.role,
    action: existing ? 'updated' : 'created',
  };
}

async function main() {
  const results = [];
  for (const spec of TEST_ACCOUNTS) {
    results.push(await upsertTestAccount(spec));
  }

  console.log('测试账号已就绪：');
  console.table(results);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
