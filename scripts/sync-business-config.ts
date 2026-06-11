/**
 * 补全 business 配置：华容道默认资源 + 从 ticket_monitor 同步飞书 webhook
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import postgres from 'postgres';
import { appConfigSchema } from 'sa2kit/common/config/bootstrap';

const HUARONGDAO_DEFAULTS = {
  theme: 'miku' as const,
  levels: [
    {
      id: 1,
      label: '难度 1',
      rows: 3,
      cols: 3,
      shuffleSteps: 60,
      sourceImageUrl: '/mikutalking/models/miku/texture/头.png',
    },
    {
      id: 2,
      label: '难度 2',
      rows: 4,
      cols: 4,
      shuffleSteps: 110,
      sourceImageUrl: '/mikutalking/models/miku/texture/头.png',
    },
    {
      id: 3,
      label: '难度 3',
      rows: 5,
      cols: 5,
      shuffleSteps: 180,
      sourceImageUrl: '/mikutalking/models/miku/texture/头.png',
    },
  ],
  bgmTracks: [
    '/linkGame/mp3/ShakeIt!-Miku.mp3',
    '/linkGame/mp3/VivalaVida.mp3',
  ],
};

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

async function loadFeishuFromProdDb(): Promise<{ webhook: string | null; secret: string | null }> {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    const rows = await sql<{ feishu_webhook_url: string | null; feishu_sign_secret: string | null }[]>`
      SELECT feishu_webhook_url, feishu_sign_secret FROM ticket_monitor_config LIMIT 1
    `.catch(() => []);
    const row = rows[0];
    return {
      webhook: row?.feishu_webhook_url?.trim() || null,
      secret: row?.feishu_sign_secret?.trim() || null,
    };
  } finally {
    await sql.end();
  }
}

function patchFile(filePath: string, feishu: { webhook: string | null; secret: string | null }) {
  const parsed = parseYaml(readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  parsed.business = parsed.business ?? {};
  const business = parsed.business as Record<string, unknown>;

  business.huarongdao = HUARONGDAO_DEFAULTS;

  const homePage = (business.homePage ?? {}) as Record<string, unknown>;
  const contact = (homePage.contactConfig ?? {}) as Record<string, unknown>;
  if (feishu.webhook) {
    contact.feishuWebhookUrl = feishu.webhook;
    contact.feishuSignSecret = feishu.secret;
  }
  homePage.contactConfig = contact;
  business.homePage = homePage;

  const validated = appConfigSchema.parse(parsed);
  writeFileSync(filePath, stringifyYaml(validated, { lineWidth: 0 }), 'utf8');
  console.log(`✓ 已更新 business → ${filePath}`);
}

async function main() {
  const feishu = await loadFeishuFromProdDb();
  for (const file of TARGETS) {
    patchFile(file, feishu);
  }
  console.log(
    feishu.webhook
      ? `✓ 飞书 webhook 已同步 (${feishu.webhook.slice(0, 40)}...)`
      : '○ 生产 ticket_monitor 无飞书 webhook，contactConfig 保持 null',
  );
  console.log('✓ 华容道 levels/bgmTracks 已写入默认资源路径');
}

main().catch((error) => {
  console.error('❌', error);
  process.exit(1);
});
