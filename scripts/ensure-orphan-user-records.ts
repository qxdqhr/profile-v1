/**
 * 为业务表中引用但 auth user 表不存在的 user_id 插入占位用户，便于 drizzle push 建立外键。
 */
import postgres from 'postgres';

const USER_ID_COLUMNS = ['user_id', 'shared_with_user_id', 'shared_by_user_id'] as const;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL 未设置');
  }

  const sql = postgres(connectionString, { ssl: false, max: 1 });

  try {
    const referencedIds = new Set<string>();

    const columns = await sql<{ table_name: string; column_name: string }[]>`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND column_name = ANY(${USER_ID_COLUMNS as unknown as string[]})
      ORDER BY table_name, column_name
    `;

    for (const { table_name, column_name } of columns) {
      const rows = await sql.unsafe(
        `SELECT DISTINCT "${column_name}" AS user_id FROM "${table_name}" WHERE "${column_name}" IS NOT NULL`,
      );
      for (const row of rows) {
        referencedIds.add(String(row.user_id));
      }
    }

    if (referencedIds.size === 0) {
      console.log('✓ 无需补建占位用户');
      return;
    }

    const existing = await sql<{ id: string }[]>`SELECT id FROM "user"`;
    const existingIds = new Set(existing.map((row) => row.id));
    const missing = [...referencedIds].filter((id) => !existingIds.has(id)).sort();

    if (missing.length === 0) {
      console.log('✓ 所有引用的 user_id 均已存在于 user 表');
      return;
    }

    const now = new Date();
    for (const id of missing) {
      const email = `${id.replace(/\D/g, '') || id}@legacy.sa2kit.local`;
      await sql`
        INSERT INTO "user" (id, name, email, "emailVerified", "phoneNumberVerified", role, "createdAt", "updatedAt")
        VALUES (
          ${id},
          ${`迁移用户 ${id}`},
          ${email},
          false,
          false,
          'USER'::"UserRole",
          ${now},
          ${now}
        )
        ON CONFLICT (id) DO NOTHING
      `;
      console.log(`✓ 已补建占位用户 id=${id}`);
    }

    console.log(`共补建 ${missing.length} 个占位用户`);
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
