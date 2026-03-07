/**
 * 数据库配置
 * Database Configuration
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// 检查环境变量
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL 未设置，数据库功能将不可用');
}

// 创建数据库连接
const queryClient = process.env.DATABASE_URL 
  ? postgres(process.env.DATABASE_URL)
  : null;

// 创建 Drizzle 实例
export const db = queryClient ? drizzle(queryClient) : null;

// 导出类型
export type Database = typeof db;

/**
 * 检查数据库是否可用
 */
export function isDatabaseAvailable(): boolean {
  return db !== null;
}










