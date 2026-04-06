import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL 环境变量未设置');
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });

async function main() {
  console.log('开始执行数据库迁移...');
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('✅ 数据库迁移完成');
  await client.end();
}

main().catch((err) => {
  console.error('❌ 数据库迁移失败:', err);
  client.end();
  process.exit(1);
});
