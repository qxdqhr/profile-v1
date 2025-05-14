import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';
import 'dotenv/config';

// 根据环境获取数据库连接URL
const connectionString = process.env.DEVELOPMENT_DATABASE_URL;

// 检查 connectionString 是否存在
if (!connectionString) {
  throw new Error(`数据库连接URL未在${process.env.NODE_ENV}环境变量中设置`);
}

// 创建Postgres客户端
const client = postgres(connectionString);

// 创建Drizzle实例
export const db = drizzle(client, { schema });

// 初始化数据库（运行迁移）
export async function initializeDb() {
  try {
    console.log('开始数据库迁移...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('数据库迁移完成！');
  } catch (error) {
    console.error('数据库迁移失败:', error);
  }
} 