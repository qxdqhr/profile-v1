#!/usr/bin/env node
/**
 * CI 飞书通知（零依赖，供 GitHub Actions 直接 node 运行，无需 pnpm install）
 */
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';

function readYamlScalar(content, key) {
  const match = content.match(new RegExp(`^\\s*${key}:\\s*(.*)$`, 'm'));
  if (!match) return null;
  const value = match[1].trim();
  if (!value || value === 'null' || value === '~') return null;
  return value.replace(/^['"]|['"]$/g, '');
}

function readFromAppConfig(key) {
  const configPath = process.env.APP_CONFIG_PATH?.trim();
  if (!configPath) return null;
  try {
    const content = readFileSync(configPath, 'utf8');
    return readYamlScalar(content, key);
  } catch (error) {
    console.warn(`[ci-feishu] 读取 APP_CONFIG_PATH 失败:`, error);
    return null;
  }
}

function readWebhookUrl() {
  return (
    process.env.FEISHU_WEBHOOK_URL?.trim()
    || process.env.CI_FEISHU_WEBHOOK_URL?.trim()
    || readFromAppConfig('feishuWebhookUrl')
    || null
  );
}

function readSignSecret() {
  return (
    process.env.FEISHU_SIGN_SECRET?.trim()
    || process.env.CI_FEISHU_SIGN_SECRET?.trim()
    || readFromAppConfig('feishuSignSecret')
    || null
  );
}

function readStatus() {
  return process.env.CI_NOTIFY_STATUS === 'success' ? 'success' : 'failure';
}

function readRequiredNumber(name, fallback = 0) {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatDateTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function buildCiFeishuMessage(context) {
  const isSuccess = context.status === 'success';
  const title = isSuccess ? '【CI 构建成功】' : '【CI 构建失败】';
  const statusText = isSuccess ? '✅ 成功' : '❌ 失败';
  const shortSha = context.sha.slice(0, 7);
  const runUrl = `${context.serverUrl}/${context.repository}/actions/runs/${context.runId}`;

  const lines = [
    `状态：${statusText}`,
    `仓库：${context.repository}`,
    `工作流：${context.workflow}`,
    `触发：${context.eventName} · ${context.refName}`,
    `Run：#${context.runNumber}`,
    `提交：${shortSha}`,
    `操作者：${context.actor}`,
    `完成时间：${formatDateTime(context.finishedAt)}`,
  ];

  if (context.imageTag) {
    lines.push(`镜像标签：${context.imageTag}`);
  }
  if (!isSuccess) {
    lines.push('', '请打开 Actions 日志查看失败步骤。');
  }

  const content = lines.filter(Boolean).map((line) => [{ tag: 'text', text: line }]);
  content.push([{ tag: 'a', text: '查看 Actions 详情', href: runUrl }]);

  return {
    msg_type: 'post',
    content: {
      post: {
        zh_cn: { title, content },
      },
    },
  };
}

function buildSignHeaders(secret) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const sign = createHmac('sha256', secret)
    .update(`${timestamp}\n${secret}`)
    .digest('base64');
  return { timestamp, sign };
}

async function sendFeishuPostMessage(webhookUrl, message, signSecret) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
  };
  if (signSecret?.trim()) {
    Object.assign(headers, buildSignHeaders(signSecret.trim()));
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(message),
    signal: AbortSignal.timeout(15000),
  });

  const text = await response.text();
  if (!response.ok) {
    return { success: false, status: response.status, errorMessage: text || `HTTP ${response.status}` };
  }

  try {
    const json = JSON.parse(text);
    if (json.code !== undefined && json.code !== 0) {
      return { success: false, status: response.status, errorMessage: json.msg || `Feishu code ${json.code}` };
    }
  } catch {
    // ignore non-json body
  }

  return { success: true, status: response.status };
}

async function main() {
  const webhookUrl = readWebhookUrl();
  if (!webhookUrl) {
    console.log('[ci-feishu] FEISHU_WEBHOOK_URL 未配置，跳过飞书通知');
    return;
  }

  const message = buildCiFeishuMessage({
    status: readStatus(),
    repository: process.env.GITHUB_REPOSITORY?.trim() || 'unknown/unknown',
    workflow: process.env.GITHUB_WORKFLOW?.trim() || 'CI',
    runNumber: readRequiredNumber('GITHUB_RUN_NUMBER'),
    runId: readRequiredNumber('GITHUB_RUN_ID'),
    eventName: process.env.GITHUB_EVENT_NAME?.trim() || 'unknown',
    refName: process.env.GITHUB_REF_NAME?.trim() || process.env.GITHUB_REF?.trim() || 'unknown',
    sha: process.env.GITHUB_SHA?.trim() || 'unknown',
    actor: process.env.GITHUB_ACTOR?.trim() || 'unknown',
    serverUrl: process.env.GITHUB_SERVER_URL?.trim() || 'https://github.com',
    finishedAt: new Date().toISOString(),
    imageTag: process.env.CI_IMAGE_TAG?.trim() || undefined,
  });

  const result = await sendFeishuPostMessage(webhookUrl, message, readSignSecret());
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
