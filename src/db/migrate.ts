/**
 * 数据库迁移脚本
 *
 * 背景：本项目早期使用 devdb:push（schema 直推），未使用 drizzle file-based migrate，
 * 导致 __drizzle_migrations 跟踪表为空或不完整。
 *
 * drizzle-orm migrator 的工作原理：
 *   - 取 __drizzle_migrations 中 created_at 最大的记录作为"基线"
 *   - 只运行 journal.when > 基线 created_at 的新迁移
 *
 * 因此，若跟踪表为空，需先插入一条基线记录（时间戳 = 最新已存在迁移），
 * 告诉 migrator 之前的迁移都已经应用过了。
 */

import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL 环境变量未设置');
}

const DRIZZLE_FOLDER = 'drizzle';
const MIGRATIONS_SCHEMA = 'drizzle';
const MIGRATIONS_TABLE = '__drizzle_migrations';

async function main() {
  const client = postgres(DATABASE_URL!, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    console.log('📋 检查迁移基线...');

    // 读取 journal，找到最新的 when 时间戳（最后一个已存在的迁移）
    const journalPath = path.join(DRIZZLE_FOLDER, 'meta', '_journal.json');
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf-8'));
    const allEntries: { idx: number; tag: string; when: number }[] = journal.entries;

    // 找最新的本地 SQL 文件对应的迁移（存根也算，因为已经在 DB 里了）
    const latestEntry = allEntries.reduce((a, b) => (a.when > b.when ? a : b));

    // 确保 schema 和 migrations 表存在
    await client`CREATE SCHEMA IF NOT EXISTS ${client(MIGRATIONS_SCHEMA)}`;
    await client`
      CREATE TABLE IF NOT EXISTS ${client(`${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE}`)} (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT
      )
    `;

    // 检查是否有记录
    const rows = await client`
      SELECT created_at FROM ${client(`${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE}`)}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const latestTracked = rows.length > 0 ? Number(rows[0].created_at) : 0;

    if (latestTracked < latestEntry.when) {
      // 跟踪表为空或滞后：插入一条基线记录覆盖所有已存在的迁移
      console.log(`⚠️  迁移基线滞后（tracked=${latestTracked} < latest=${latestEntry.when}），更新基线...`);
      await client`
        INSERT INTO ${client(`${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE}`)} (hash, created_at)
        VALUES (${'baseline-' + latestEntry.tag}, ${latestEntry.when})
      `;
      console.log(`✅ 基线已更新至 ${latestEntry.tag}，历史迁移将被跳过`);
    } else {
      console.log(`✅ 迁移基线已是最新（created_at=${latestTracked}）`);
    }

    console.log('🚀 开始执行新迁移...');
    await migrate(db, { migrationsFolder: DRIZZLE_FOLDER });
    console.log('✅ 数据库迁移完成');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('❌ 数据库迁移失败:', err);
  process.exit(1);
});
