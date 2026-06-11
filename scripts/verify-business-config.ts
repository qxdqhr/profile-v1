import { ensureAppConfigLoaded } from '@/lib/config/init';
import { readBusinessConfig, writeBusinessConfig } from '@/lib/config/business-config';
import { getHomePageConfig, saveHomePageConfig } from '@/modules/Home/server/homePageConfigService';
import { buildPersistedConfig, DEFAULT_HUARONGDAO_PERSISTED_CONFIG } from '@/modules/testField/huarongdao/shared';
import postgres from 'postgres';

async function assertConfigManagerTablesDropped() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    const rows = await sql<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('config_categories', 'config_items', 'config_history', 'config_permissions')
    `;
    if (rows.length > 0) {
      throw new Error(`configManager 表仍存在: ${rows.map((r) => r.table_name).join(', ')}`);
    }
    console.log('✓ configManager 表已删除');
  } finally {
    await sql.end();
  }
}

async function assertHomePageRoundTrip() {
  const before = await getHomePageConfig();
  const marker = `verify-${Date.now()}`;
  const saved = await saveHomePageConfig({
    ...before,
    homeConfig: { ...before.homeConfig, title: marker },
  });
  if (saved.homeConfig.title !== marker) {
    throw new Error('首页配置写入 YAML 后读取不一致');
  }
  await saveHomePageConfig(before);
  console.log('✓ 首页配置 YAML 读写正常');
}

async function assertHuarongdaoRoundTrip() {
  const sample = buildPersistedConfig({
    ...DEFAULT_HUARONGDAO_PERSISTED_CONFIG,
    theme: 'sakura',
  });
  writeBusinessConfig((business) => ({ ...business, huarongdao: sample }));
  const loaded = readBusinessConfig().huarongdao;
  const normalized = buildPersistedConfig(loaded);
  if (normalized.theme !== 'sakura') {
    throw new Error('华容道配置写入 YAML 后读取不一致');
  }
  writeBusinessConfig((business) => ({
    ...business,
    huarongdao: DEFAULT_HUARONGDAO_PERSISTED_CONFIG,
  }));
  console.log('✓ 华容道配置 YAML 读写正常');
}

async function main() {
  ensureAppConfigLoaded();
  await assertConfigManagerTablesDropped();
  await assertHomePageRoundTrip();
  await assertHuarongdaoRoundTrip();
  console.log('✅ 业务配置迁移验证通过');
}

main().catch((error) => {
  console.error('❌ 验证失败:', error);
  process.exit(1);
});
