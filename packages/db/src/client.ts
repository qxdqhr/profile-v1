import { ensureAppConfigLoaded } from '@profile/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

interface DatabaseConfig {
  url: string;
  poolSize?: number;
  timeout?: number;
  sslMode?: string;
}

type SqlClient = ReturnType<typeof postgres>;
type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

function getDatabaseConfig(): DatabaseConfig {
  const appConfig = ensureAppConfigLoaded();
  const connectionString = process.env.DATABASE_URL?.trim() || appConfig.database.url;

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

/** Map AppConfig sslMode → postgres.js `ssl` option */
function resolvePostgresSsl(
  sslMode: string | undefined,
): false | 'prefer' | 'require' | 'verify-full' {
  switch ((sslMode ?? 'prefer').toLowerCase()) {
    case 'disable':
    case 'false':
      return false;
    case 'require':
      return 'require';
    case 'verify-full':
    case 'verify_full':
      return 'verify-full';
    case 'prefer':
    case 'allow':
    default:
      return 'prefer';
  }
}

let client: SqlClient | undefined;
let dbInstance: DrizzleDb | undefined;
let cachedDbConfig: DatabaseConfig | undefined;

function ensureConnection(): { client: SqlClient; db: DrizzleDb; dbConfig: DatabaseConfig } {
  if (client && dbInstance && cachedDbConfig) {
    return { client, db: dbInstance, dbConfig: cachedDbConfig };
  }

  cachedDbConfig = getDatabaseConfig();
  client = postgres(cachedDbConfig.url, {
    max: cachedDbConfig.poolSize,
    idle_timeout: cachedDbConfig.timeout,
    connect_timeout: cachedDbConfig.timeout,
    ssl: resolvePostgresSsl(cachedDbConfig.sslMode),
    connection: {
      application_name: 'profile-v1-app',
    },
    onnotice: () => {},
  } as Parameters<typeof postgres>[1]);
  dbInstance = drizzle(client, { schema });

  // 连接后设置会话默认值（不依赖已从类型中移除的 afterConnect）
  void (async () => {
    try {
      await client!`SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED`;
      await client!`SET SESSION synchronous_commit = on`;
      console.log('数据库连接已设置事务隔离级别为 READ COMMITTED');
    } catch (error) {
      console.warn('设置事务隔离级别失败:', error);
    }
  })();

  return { client, db: dbInstance, dbConfig: cachedDbConfig };
}

/**
 * 懒连接：仅在首次访问 `db` 时加载配置并建连。
 * 禁止在 client bundle 导入本模块（server-only）。
 */
export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    const real = ensureConnection().db;
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(real) : value;
  },
});

/** 懒导出：读取时才解析配置（兼容旧 `dbConfig` 导入） */
export const dbConfig: DatabaseConfig = new Proxy({} as DatabaseConfig, {
  get(_target, prop, receiver) {
    return Reflect.get(ensureConnection().dbConfig as object, prop, receiver);
  },
});

export async function forceRefreshDatabaseConnection() {
  try {
    console.log('🔄 强制刷新数据库连接...');
    const { client: sql } = ensureConnection();
    await sql`SELECT 1 as connection_check`;
    await sql`SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED`;
    await sql`SET SESSION synchronous_commit = on`;
    console.log('✅ 数据库连接刷新完成');
  } catch (error) {
    console.error('❌ 数据库连接刷新失败:', error);
    throw error;
  }
}

export async function getDatabaseConnectionStatus() {
  try {
    const { client: sql } = ensureConnection();
    const result = await sql`SELECT version(), current_database(), current_user, inet_server_addr() as server_ip`;
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

/** 显式工厂（脚本 / 测试优先用这个，语义更清晰） */
export function getDb(): DrizzleDb {
  return ensureConnection().db;
}
