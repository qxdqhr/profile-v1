/**
 * 将本地 app.config.local.yaml 的 business 节同步到 production.plain.yaml
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { appConfigSchema } from 'sa2kit/common/config/bootstrap';

const LOCAL = '/home/qhr/project/profile-v1/config/app.config.local.yaml';
const PROD_PLAIN = [
  '/home/qhr/project/profile-v1/config/app.config.production.plain.yaml',
  '/home/qhr/Desktop/project/profile-v1/config/app.config.production.plain.yaml',
];

function main() {
  const local = parseYaml(readFileSync(LOCAL, 'utf8')) as Record<string, unknown>;
  for (const prodPath of PROD_PLAIN) {
    let prod: Record<string, unknown>;
    try {
      prod = parseYaml(readFileSync(prodPath, 'utf8')) as Record<string, unknown>;
    } catch {
      continue;
    }
    prod.business = local.business;
    prod.storage = {
      ...(prod.storage as object),
      aliyunOss: (local.storage as { aliyunOss?: unknown })?.aliyunOss,
    };
    const validated = appConfigSchema.parse(prod);
    writeFileSync(prodPath, stringifyYaml(validated, { lineWidth: 0 }), 'utf8');
    console.log(`✓ 已同步 business + OSS → ${prodPath}`);
  }
}

main();
