/**
 * Better Auth 1.7+ 需要 account.issuer；为已有 credential 行补列并回填 local:credential。
 */
import postgres from 'postgres';

const CREDENTIAL_ISSUER = 'local:credential';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL 未设置');
  }

  const sql = postgres(connectionString, { ssl: false, max: 1 });

  try {
    await sql.unsafe(`
      ALTER TABLE account ADD COLUMN IF NOT EXISTS issuer text;
    `);

    const updated = await sql`
      UPDATE account
      SET issuer = ${CREDENTIAL_ISSUER}
      WHERE "providerId" = 'credential'
        AND (issuer IS NULL OR issuer = '')
    `;

    await sql.unsafe(`
      ALTER TABLE account ALTER COLUMN issuer SET DEFAULT '${CREDENTIAL_ISSUER}';
    `);

    await sql.unsafe(`
      UPDATE account SET issuer = '${CREDENTIAL_ISSUER}' WHERE issuer IS NULL;
    `);

    await sql.unsafe(`
      ALTER TABLE account ALTER COLUMN issuer SET NOT NULL;
    `);

    console.log(`✓ account.issuer 已就绪（credential 回填 ${updated.count} 行）`);
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
