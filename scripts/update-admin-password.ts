/**
 * 将 role 为 admin / super_admin 的用户的密码更新为 ADMIN_NEW_PASSWORD 的 bcrypt(12) 哈希。
 * 用法: ADMIN_NEW_PASSWORD='...' APP_CONFIG_ENV=production tsx --import ./scripts/preload-app-config.ts scripts/update-admin-password.ts
 */
import bcrypt from 'bcryptjs';
import { eq, inArray, or } from 'drizzle-orm';
import { db } from '../src/db/index';
import { userSessions, users } from '../src/lib/auth/schema';

const pwd = process.env.ADMIN_NEW_PASSWORD?.trim();
if (!pwd || pwd.length < 6) {
  console.error('请设置环境变量 ADMIN_NEW_PASSWORD（至少 6 位，与登录接口一致）');
  process.exit(1);
}

async function main() {
  const hash = await bcrypt.hash(pwd, 12);

  const updated = await db
    .update(users)
    .set({ password: hash, updatedAt: new Date() })
    .where(or(eq(users.role, 'admin'), eq(users.role, 'super_admin')))
    .returning({ id: users.id, phone: users.phone, role: users.role });

  if (updated.length === 0) {
    console.error('未找到 role 为 admin 或 super_admin 的用户，未做任何更新。');
    process.exit(2);
  }

  const ids = updated.map((r) => r.id);
  await db.delete(userSessions).where(inArray(userSessions.userId, ids));

  console.log('已更新管理员密码并清除其会话，需重新登录。受影响行数:', updated.length);
  console.table(updated.map((r) => ({ id: r.id, phone: r.phone, role: r.role })));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
