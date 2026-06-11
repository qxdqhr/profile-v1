/**
 * 从生产 showmaster_config_items 拉取 OSS 密钥，写入本地/生产 YAML（一次性迁移辅助）
 * 输出不含完整密钥。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import postgres from 'postgres';
import { appConfigSchema } from 'sa2kit/common/config/bootstrap';

const OSS_KEYS = [
  'ALIYUN_OSS_ACCESS_KEY_ID',
  'ALIYUN_OSS_ACCESS_KEY_SECRET',
  'ALIYUN_OSS_BUCKET',
  'ALIYUN_OSS_REGION',
  'ALIYUN_OSS_CUSTOM_DOMAIN',
] as const;

const TARGETS = [
  '/home/qhr/project/profile-v1/config/app.config.local.yaml',
  '/home/qhr/Desktop/project/profile-v1/config/app.config.local.yaml',
  '/home/qhr/project/profile-v1/config/app.config.production.plain.yaml',
  '/home/qhr/Desktop/project/profile-v1/config/app.config.production.plain.yaml',
].filter((path) => {
  try {
    readFileSync(path, 'utf8');
    return true;
  } catch {
    return false;
  }
});

async function loadOssFromProdDb(): Promise<Record<string, string>> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL 未设置');

  const sql = postgres(url, { max: 1 });
  try {
    const rows = await sql<{ key: string; value: string | null }[]>`
      SELECT key, value FROM showmaster_config_items
      WHERE environment = 'production'
        AND key = ANY(${[...OSS_KEYS]})
    `;
    const map: Record<string, string> = {};
    for (const row of rows) {
      if (row.value?.trim()) map[row.key] = row.value.trim();
    }
    return map;
  } finally {
    await sql.end();
  }
}

function patchYamlFile(filePath: string, oss: Record<string, string>) {
  const parsed = parseYaml(readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  parsed.storage = parsed.storage ?? {};
  const storage = parsed.storage as Record<string, unknown>;
  storage.aliyunOss = {
    enabled: true,
    region: oss.ALIYUN_OSS_REGION ?? 'oss-cn-beijing',
    bucket: oss.ALIYUN_OSS_BUCKET ?? 'profile-qhr-resource',
    accessKeyId: oss.ALIYUN_OSS_ACCESS_KEY_ID ?? '',
    accessKeySecret: oss.ALIYUN_OSS_ACCESS_KEY_SECRET ?? '',
    customDomain: oss.ALIYUN_OSS_CUSTOM_DOMAIN ?? '',
    secure: true,
    internal: false,
  };

  const validated = appConfigSchema.parse(parsed);
  writeFileSync(filePath, stringifyYaml(validated, { lineWidth: 0 }), 'utf8');
  console.log(`✓ 已更新 OSS → ${filePath}`);
}

async function main() {
  const oss = await loadOssFromProdDb();
  if (!oss.ALIYUN_OSS_ACCESS_KEY_ID || !oss.ALIYUN_OSS_ACCESS_KEY_SECRET) {
    throw new Error('生产 showmaster_config_items 中未找到完整 OSS 密钥');
  }
  for (const file of TARGETS) {
    patchYamlFile(file, oss);
  }
  console.log(
    `✓ OSS 已启用 region=${oss.ALIYUN_OSS_REGION} bucket=${oss.ALIYUN_OSS_BUCKET} AK=${oss.ALIYUN_OSS_ACCESS_KEY_ID.slice(0, 8)}...`,
  );
}

main().catch((error) => {
  console.error('❌', error);
  process.exit(1);
});
