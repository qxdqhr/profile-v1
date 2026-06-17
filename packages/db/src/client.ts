import { ensureAppConfigLoaded } from '@profile/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

ensureAppConfigLoaded();

interface DatabaseConfig {
  url: string;
  poolSize?: number;
  timeout?: number;
  sslMode?: string;
}

function getDatabaseConfig(): DatabaseConfig {
  const appConfig = ensureAppConfigLoaded();
  const connectionString = appConfig.database.url;

  if (!connectionString) {
    throw new Error('database.url 未在 AppConfig 中设置');
  }

  const poolSize = appConfig.database.poolSize ?? 10;
  const timeout = appConfig.database.timeout ?? 5000;
  const sslMode = appConfig.database.sslMode ?? 'prefer';

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
    sslMode,
  };
}

const dbConfig = getDatabaseConfig();

const postgresConfig = {
  max: dbConfig.poolSize,
  idle_timeout: dbConfig.timeout,
  connect_timeout: dbConfig.timeout,
  ssl: false,
  connection: {
    application_name: 'profile-v1-app',
  },
  onnotice: () => {},
  afterConnect: async (connection: { query: (sql: string) => Promise<unknown> }) => {
    try {
      await connection.query('SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED');
      await connection.query('SET SESSION synchronous_commit = on');
      console.log('数据库连接已设置事务隔离级别为 READ COMMITTED');
    } catch (error) {
      console.warn('设置事务隔离级别失败:', error);
    }
  },
};

const client = postgres(dbConfig.url, postgresConfig);

export const db = drizzle(client, { schema });

export async function forceRefreshDatabaseConnection() {
  try {
    console.log('🔄 强制刷新数据库连接...');
    await client`SELECT 1 as connection_check`;
    await client`SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED`;
    await client`SET SESSION synchronous_commit = on`;
    console.log('✅ 数据库连接刷新完成');
  } catch (error) {
    console.error('❌ 数据库连接刷新失败:', error);
    throw error;
  }
}

export async function getDatabaseConnectionStatus() {
  try {
    const result = await client`SELECT version(), current_database(), current_user, inet_server_addr() as server_ip`;
    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

export { dbConfig };
