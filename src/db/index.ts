import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { config } from 'dotenv';

// 根据环境加载对应的环境变量文件
const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
  config({ path: '.env.development' });
} else if (env === 'production') {
  config({ path: '.env.production' });
} else {
  config(); // 默认加载 .env
}

// 数据库连接配置
interface DatabaseConfig {
  url: string;
  poolSize?: number;
  timeout?: number;
  sslMode?: string;
}

// 获取数据库配置
function getDatabaseConfig(): DatabaseConfig {
  // 数据库连接URL必须从环境变量读取
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    const env = process.env.NODE_ENV || 'development';
    throw new Error(`数据库连接URL未在${env}环境变量中设置`);
  }

  // 从环境变量读取数据库相关配置（可选）
  const poolSize = process.env.DATABASE_POOL_SIZE ? parseInt(process.env.DATABASE_POOL_SIZE) : 10;
  const timeout = process.env.DATABASE_TIMEOUT ? parseInt(process.env.DATABASE_TIMEOUT) : 5000;
  const sslMode = process.env.DATABASE_SSL_MODE || 'prefer';

  // 验证配置
  if (poolSize <= 0 || poolSize > 100) {
    console.warn('⚠️ 数据库连接池大小超出合理范围，使用默认值10');
  }
  
  if (timeout <= 0 || timeout > 30000) {
    console.warn('⚠️ 数据库连接超时超出合理范围，使用默认值5000ms');
  }

  return {
    url: connectionString,
    poolSize: Math.max(1, Math.min(100, poolSize)),
    timeout: Math.max(1000, Math.min(30000, timeout)),
    sslMode
  };
}

// 获取数据库配置
const dbConfig = getDatabaseConfig();

// 创建Postgres客户端配置
const postgresConfig = {
  max: dbConfig.poolSize,
  idle_timeout: dbConfig.timeout,
  connect_timeout: dbConfig.timeout,
  // 禁用SSL以避免TLS连接问题
  ssl: false,
  // 添加连接重试配置
  connection: {
    application_name: 'profile-v1-app'
  }
};

// 创建Postgres客户端
const client = postgres(dbConfig.url, postgresConfig);

// 创建Drizzle实例
export const db = drizzle(client, { schema });

// 导出数据库配置（用于调试）
export { dbConfig }; 