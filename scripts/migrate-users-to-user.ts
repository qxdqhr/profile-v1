/**
 * 将旧表 `users`（integer id）合并进 better-auth 的 `user`（text id），
 * 并把业务表 integer user_id 改为 text FK → user，最后删除 users / user_sessions。
 *
 * 用法:
 *   pnpm exec tsx --import @profile/config/preload scripts/migrate-users-to-user.ts --dry-run
 *   pnpm exec tsx --import @profile/config/preload scripts/migrate-users-to-user.ts
 *
 * 生产请先备份，务必先 --dry-run 看映射覆盖率。
 */
import postgres from 'postgres';
import { nanoid } from 'nanoid';
import { CREDENTIAL_ACCOUNT_ISSUER } from '@profile/auth/schema';

const dryRun = process.argv.includes('--dry-run');

type OldUser = {
  id: number;
  phone: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
  password: string | null;
};

type Mapping = {
  oldId: number;
  newId: string;
  phone: string | null;
  action: 'matched' | 'created' | 'created_no_phone';
  passwordMigrated: boolean;
};

/** integer FK → users 的列；onDelete 与现 drizzle 语义对齐 */
const INTEGER_FK_COLUMNS: Array<{
  table: string;
  column: string;
  onDelete: 'CASCADE' | 'SET NULL';
}> = [
  { table: 'calendar_events', column: 'user_id', onDelete: 'CASCADE' },
  { table: 'calendar_configs', column: 'user_id', onDelete: 'CASCADE' },
  { table: 'event_shares', column: 'shared_by_user_id', onDelete: 'CASCADE' },
  { table: 'event_shares', column: 'shared_with_user_id', onDelete: 'CASCADE' },
  { table: 'idea_lists', column: 'user_id', onDelete: 'CASCADE' },
  { table: 'mmd_models', column: 'user_id', onDelete: 'SET NULL' },
  { table: 'mmd_animations', column: 'user_id', onDelete: 'SET NULL' },
  { table: 'mmd_audios', column: 'user_id', onDelete: 'SET NULL' },
  { table: 'mmd_scenes', column: 'user_id', onDelete: 'SET NULL' },
  { table: 'mmd_model_favorites', column: 'user_id', onDelete: 'CASCADE' },
  { table: 'mmd_animation_favorites', column: 'user_id', onDelete: 'CASCADE' },
];

function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return digits.length > 0 ? digits : null;
}

function mapRole(role: string | null): 'USER' | 'ADMIN' | 'SUPER_ADMIN' {
  const r = (role ?? 'user').toLowerCase();
  if (r === 'super_admin' || r === 'superadmin') return 'SUPER_ADMIN';
  if (r === 'admin') return 'ADMIN';
  return 'USER';
}

function emailFromPhone(phone: string): string {
  return `${phone}@phone.sa2kit.local`;
}

function looksLikeBcrypt(hash: string | null | undefined): boolean {
  return Boolean(hash && /^\$2[aby]\$/.test(hash) && hash.length >= 50);
}

async function tableExists(sql: postgres.Sql, name: string): Promise<boolean> {
  const [row] = await sql<{ ok: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${name}
    ) AS ok
  `;
  return Boolean(row?.ok);
}

async function columnMeta(
  sql: postgres.Sql,
  table: string,
  column: string,
): Promise<{ data_type: string; is_nullable: string } | null> {
  const [row] = await sql<{ data_type: string; is_nullable: string }[]>`
    SELECT data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${table}
      AND column_name = ${column}
  `;
  return row ?? null;
}

async function dropFksOnColumn(sql: postgres.Sql, table: string, column: string) {
  const rows = await sql<{ constraint_name: string }[]>`
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = ${table}
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = ${column}
  `;
  for (const row of rows) {
    await sql.unsafe(
      `ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${row.constraint_name}"`,
    );
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL 未设置（请用 --import @profile/config/preload）');
  }

  const sql = postgres(connectionString, { ssl: false, max: 1 });

  try {
    console.log(dryRun ? '=== DRY RUN（不写库）===' : '=== 执行迁移 users → user ===');

    if (!(await tableExists(sql, 'users'))) {
      console.log('⊘ 旧表 users 不存在，无需迁移');
      return;
    }
    if (!(await tableExists(sql, 'user'))) {
      throw new Error('新表 "user" 不存在，请先创建 better-auth 四表');
    }

    const oldUsers = await sql<OldUser[]>`
      SELECT id, phone, name, email, role, password
      FROM users
      ORDER BY id
    `;
    console.log(`旧 users 行数: ${oldUsers.length}`);

    const mappings: Mapping[] = [];

    for (const old of oldUsers) {
      const phone = normalizePhone(old.phone);
      const now = new Date();
      let newId: string;
      let action: Mapping['action'];
      let passwordMigrated = false;

      if (phone) {
        const [existing] = await sql<{ id: string }[]>`
          SELECT id FROM "user" WHERE "phoneNumber" = ${phone} LIMIT 1
        `;
        if (existing) {
          newId = existing.id;
          action = 'matched';
          if (!dryRun) {
            await sql`
              UPDATE "user"
              SET
                name = COALESCE(NULLIF(${old.name ?? ''}, ''), name),
                role = ${mapRole(old.role)},
                "phoneNumberVerified" = true,
                "updatedAt" = ${now}
              WHERE id = ${newId}
            `;
          }
        } else {
          newId = nanoid();
          action = 'created';
          const email = old.email?.trim() || emailFromPhone(phone);
          if (!dryRun) {
            await sql`
              INSERT INTO "user" (
                id, name, email, "emailVerified", "phoneNumber", "phoneNumberVerified",
                role, "createdAt", "updatedAt"
              ) VALUES (
                ${newId},
                ${old.name?.trim() || phone},
                ${email},
                false,
                ${phone},
                true,
                ${mapRole(old.role)},
                ${now},
                ${now}
              )
            `;
          }
        }

        if (looksLikeBcrypt(old.password)) {
          passwordMigrated = true;
          if (!dryRun) {
            const [cred] = await sql<{ id: string }[]>`
              SELECT id FROM account
              WHERE "userId" = ${newId} AND "providerId" = 'credential'
              LIMIT 1
            `;
            if (cred) {
              await sql`
                UPDATE account
                SET
                  issuer = ${CREDENTIAL_ACCOUNT_ISSUER},
                  "accountId" = ${newId},
                  password = ${old.password},
                  "updatedAt" = ${now}
                WHERE id = ${cred.id}
              `;
            } else {
              await sql`
                INSERT INTO account (
                  id, issuer, "accountId", "providerId", "userId", password,
                  "createdAt", "updatedAt"
                ) VALUES (
                  ${nanoid()},
                  ${CREDENTIAL_ACCOUNT_ISSUER},
                  ${newId},
                  'credential',
                  ${newId},
                  ${old.password},
                  ${now},
                  ${now}
                )
              `;
            }
          }
        } else if (old.password) {
          console.warn(
            `⚠ old users.id=${old.id} phone=${phone} 密码哈希非 bcrypt，跳过写入 account（需 OTP/重置）`,
          );
        }
      } else {
        newId = nanoid();
        action = 'created_no_phone';
        const placeholderEmail = `legacy-users-${old.id}@migrated.sa2kit.local`;
        if (!dryRun) {
          await sql`
            INSERT INTO "user" (
              id, name, email, "emailVerified", "phoneNumber", "phoneNumberVerified",
              role, "createdAt", "updatedAt"
            ) VALUES (
              ${newId},
              ${old.name?.trim() || `legacy-${old.id}`},
              ${placeholderEmail},
              false,
              NULL,
              false,
              ${mapRole(old.role)},
              ${now},
              ${now}
            )
          `;
        }
      }

      mappings.push({
        oldId: old.id,
        newId,
        phone,
        action,
        passwordMigrated,
      });
    }

    console.log('\n映射表:');
    console.table(mappings);

    // FK 列：drop → remap → alter type → add FK
    for (const { table, column, onDelete } of INTEGER_FK_COLUMNS) {
      if (!(await tableExists(sql, table))) {
        console.log(`⊘ 跳过不存在的表 ${table}`);
        continue;
      }
      const meta = await columnMeta(sql, table, column);
      if (!meta) {
        console.log(`⊘ ${table}.${column} 不存在`);
        continue;
      }
      const { data_type: dtype, is_nullable } = meta;

      console.log(`\n→ ${table}.${column} (${dtype}, nullable=${is_nullable})`);

      if (dryRun) {
        console.log(`  [dry-run] DROP FK; remap int→text; ALTER TYPE text; ADD FK → user (${onDelete})`);
        continue;
      }

      await dropFksOnColumn(sql, table, column);

      if (dtype === 'integer' || dtype === 'bigint') {
        const tmp = `${column}__mig_txt`;
        await sql.unsafe(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${tmp}" text`);
        for (const m of mappings) {
          await sql.unsafe(
            `UPDATE "${table}" SET "${tmp}" = '${m.newId.replace(/'/g, "''")}' WHERE "${column}" = ${m.oldId}`,
          );
        }
        await sql.unsafe(`ALTER TABLE "${table}" DROP COLUMN "${column}"`);
        await sql.unsafe(`ALTER TABLE "${table}" RENAME COLUMN "${tmp}" TO "${column}"`);
        if (is_nullable === 'NO') {
          await sql.unsafe(`ALTER TABLE "${table}" ALTER COLUMN "${column}" SET NOT NULL`);
        }
      } else if (dtype === 'text' || dtype === 'character varying') {
        for (const m of mappings) {
          const oldStr = String(m.oldId).replace(/'/g, "''");
          const newStr = m.newId.replace(/'/g, "''");
          await sql.unsafe(
            `UPDATE "${table}" SET "${column}" = '${newStr}' WHERE "${column}" = '${oldStr}'`,
          );
        }
      }

      const fkName = `${table}_${column}_user_fk`;
      await sql.unsafe(`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${fkName}"`);
      await sql.unsafe(
        `ALTER TABLE "${table}"
         ADD CONSTRAINT "${fkName}"
         FOREIGN KEY ("${column}") REFERENCES "user"("id") ON DELETE ${onDelete}`,
      );
      console.log(`  ✓ 已挂 FK → user (${onDelete})`);
    }

    if (dryRun) {
      console.log('\n[dry-run] 将删除 user_sessions、users（及 sequence）');
    } else {
      if (await tableExists(sql, 'user_sessions')) {
        await sql.unsafe(`DROP TABLE IF EXISTS user_sessions CASCADE`);
        console.log('\n✓ 已删除 user_sessions');
      }
      await sql.unsafe(`DROP TABLE IF EXISTS users CASCADE`);
      await sql.unsafe(`DROP SEQUENCE IF EXISTS users_id_seq CASCADE`);
      console.log('✓ 已删除 users');
    }

    // 校验
    const usersGone = !(await tableExists(sql, 'users'));
    const [authCount] = await sql<{ n: string }[]>`
      SELECT COUNT(*)::text AS n FROM "user"
    `;
    console.log('\n校验:');
    console.log(`  users 已删除: ${dryRun ? '(dry-run 跳过)' : usersGone}`);
    console.log(`  user 行数: ${authCount?.n}`);
    for (const { table, column } of INTEGER_FK_COLUMNS) {
      if (!(await tableExists(sql, table))) continue;
      const meta = await columnMeta(sql, table, column);
      if (meta) console.log(`  ${table}.${column}: ${meta.data_type} nullable=${meta.is_nullable}`);
    }

    if (dryRun) {
      console.log('\nDRY RUN 完成，未修改数据库。去掉 --dry-run 再执行。');
    } else {
      console.log('\n迁移完成。');
    }
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
