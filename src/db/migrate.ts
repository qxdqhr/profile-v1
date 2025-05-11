import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './index';
import 'dotenv/config';

// 执行数据库迁移
async function main() {
  try {
    console.log('开始执行数据库迁移...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('数据库迁移完成！');
    process.exit(0);
  } catch (error) {
    console.error('数据库迁移失败：', error);
    process.exit(1);
  }
}

main(); 