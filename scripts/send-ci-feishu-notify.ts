import {
  buildCiFeishuMessage,
  sendFeishuPostMessage,
  type CiNotifyStatus,
} from '@sa2kit/feishu-bot';

function readWebhookUrl(): string | null {
  return process.env.FEISHU_WEBHOOK_URL?.trim()
    || process.env.CI_FEISHU_WEBHOOK_URL?.trim()
    || null;
}

function readSignSecret(): string | null {
  return process.env.FEISHU_SIGN_SECRET?.trim()
    || process.env.CI_FEISHU_SIGN_SECRET?.trim()
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
