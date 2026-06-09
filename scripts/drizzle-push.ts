/**
 * drizzle-kit push 包装器：忽略末尾误删 UserRole enum 的已知错误（drizzle-kit 0.31.x）。
 */
import { spawn } from 'node:child_process';
import postgres from 'postgres';

const USER_ROLE_DROP_ERROR = 'cannot drop type "UserRole"';

async function verifyAuthSchema(): Promise<boolean> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL 未设置');
  }

  const sql = postgres(connectionString, { ssl: false, max: 1 });

  try {
    const [enumRow] = await sql<{ ok: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'UserRole'
      ) AS ok
    `;
    const [tablesRow] = await sql<{ ok: boolean }[]>`
      SELECT COUNT(*) = 4 AS ok
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN ('user', 'session', 'account', 'verification')
    `;
    const [roleCol] = await sql<{ ok: boolean }[]>`
      SELECT udt_name = 'UserRole' AS ok
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'user'
        AND column_name = 'role'
    `;

    return Boolean(enumRow?.ok && tablesRow?.ok && roleCol?.ok);
  } finally {
    await sql.end();
  }
}

async function runDrizzlePush(): Promise<{ code: number; output: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['drizzle-kit', 'push'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: process.env,
    });

    let output = '';

    child.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });

    child.on('error', reject);
    child.on('close', (code) => resolve({ code: code ?? 1, output }));
  });
}

async function main() {
  const { code, output } = await runDrizzlePush();
  const hasUserRoleDropBug = output.includes(USER_ROLE_DROP_ERROR);

  if (hasUserRoleDropBug) {
    const ok = await verifyAuthSchema();
    if (ok) {
      console.warn(
        '⚠ drizzle-kit 末尾尝试删除 UserRole enum 失败（drizzle-kit 0.31.x 已知问题），auth schema 已验证正常，push 视为成功。',
      );
      return;
    }
  }

  if (code === 0) {
    console.log('✓ drizzle-kit push 完成');
    return;
  }

  process.exit(code);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
