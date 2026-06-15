import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import {
  buildCiFeishuMessage,
  sendFeishuPostMessage,
  type CiNotifyStatus,
} from '@sa2kit/feishu-bot';

function readWebhookFromAppConfig(): string | null {
  const configPath = process.env.APP_CONFIG_PATH?.trim();
  if (!configPath) return null;

  try {
    const parsed = parseYaml(readFileSync(configPath, 'utf8')) as Record<string, unknown>;
    const business = parsed.business as Record<string, unknown> | undefined;
    const homePage = business?.homePage as Record<string, unknown> | undefined;
    const contact = homePage?.contactConfig as Record<string, unknown> | undefined;
    const webhook = typeof contact?.feishuWebhookUrl === 'string'
      ? contact.feishuWebhookUrl.trim()
      : '';
    return webhook || null;
  } catch (error) {
    console.warn('[ci-feishu] 读取 APP_CONFIG_PATH 失败:', error);
    return null;
  }
}

function readWebhookUrl(): string | null {
  return process.env.FEISHU_WEBHOOK_URL?.trim()
    || process.env.CI_FEISHU_WEBHOOK_URL?.trim()
    || readWebhookFromAppConfig()
    || null;
}

function readSignSecretFromAppConfig(): string | null {
  const configPath = process.env.APP_CONFIG_PATH?.trim();
  if (!configPath) return null;

  try {
    const parsed = parseYaml(readFileSync(configPath, 'utf8')) as Record<string, unknown>;
    const business = parsed.business as Record<string, unknown> | undefined;
    const homePage = business?.homePage as Record<string, unknown> | undefined;
    const contact = homePage?.contactConfig as Record<string, unknown> | undefined;
    const secret = typeof contact?.feishuSignSecret === 'string'
      ? contact.feishuSignSecret.trim()
      : '';
    return secret || null;
  } catch {
    return null;
  }
}

function readSignSecret(): string | null {
  return process.env.FEISHU_SIGN_SECRET?.trim()
    || process.env.CI_FEISHU_SIGN_SECRET?.trim()
    || readSignSecretFromAppConfig()
    || null;
}

function readStatus(): CiNotifyStatus {
  return process.env.CI_NOTIFY_STATUS === 'success' ? 'success' : 'failure';
}

function readRequiredNumber(name: string, fallback = 0): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function main() {
  const webhookUrl = readWebhookUrl();
  if (!webhookUrl) {
    console.log('[ci-feishu] FEISHU_WEBHOOK_URL 未配置，跳过飞书通知');
    return;
  }

  const repository = process.env.GITHUB_REPOSITORY?.trim() || 'unknown/unknown';
  const runNumber = readRequiredNumber('GITHUB_RUN_NUMBER');
  const runId = readRequiredNumber('GITHUB_RUN_ID');
  const eventName = process.env.GITHUB_EVENT_NAME?.trim() || 'unknown';
  const refName = process.env.GITHUB_REF_NAME?.trim() || process.env.GITHUB_REF?.trim() || 'unknown';
  const sha = process.env.GITHUB_SHA?.trim() || 'unknown';
  const actor = process.env.GITHUB_ACTOR?.trim() || 'unknown';
  const workflow = process.env.GITHUB_WORKFLOW?.trim() || 'CI';
  const serverUrl = process.env.GITHUB_SERVER_URL?.trim() || 'https://github.com';
  const imageTag = process.env.CI_IMAGE_TAG?.trim() || undefined;

  const message = buildCiFeishuMessage({
    status: readStatus(),
    repository,
    workflow,
    runNumber,
    runId,
    eventName,
    refName,
    sha,
    actor,
    serverUrl,
    finishedAt: new Date().toISOString(),
    imageTag,
  });

  const result = await sendFeishuPostMessage(
    webhookUrl,
    message,
    readSignSecret(),
  );

  if (!result.success) {
    console.error('[ci-feishu] 发送失败:', result.errorMessage || `HTTP ${result.status}`);
    process.exit(1);
  }

  console.log('[ci-feishu] 通知已发送');
}

main().catch((error) => {
  console.error('[ci-feishu] 未预期错误:', error);
  process.exit(1);
});
