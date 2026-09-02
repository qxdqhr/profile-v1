import { NapCatClient } from 'sa2kit/business/qqbot/server';
import { sendFeishuPostMessage } from '@sa2kit/feishu-bot';
import {
  buildContactFeishuMessage,
  buildContactQqMessage,
  type ContactSubmission,
} from './buildContactMessage';
import {
  getHomeContactChannelConfig,
  hasAnyHomeContactChannel,
  type HomeContactChannelConfig,
} from './contactConfig';

export type ContactChannelStatus = 'success' | 'failed' | 'skipped';

export interface ContactNotifyResult {
  ok: boolean;
  channels: {
    feishu: ContactChannelStatus;
    qq: ContactChannelStatus;
  };
  errors: string[];
}

function createNapCatClient(config: HomeContactChannelConfig) {
  return new NapCatClient({
    baseUrl: config.napCatBaseUrl,
    accessToken: config.napCatToken,
    timeoutMs: config.napCatTimeoutMs,
  });
}

async function sendFeishu(
  config: HomeContactChannelConfig,
  submission: ContactSubmission,
): Promise<{ status: ContactChannelStatus; error?: string }> {
  if (!config.feishuWebhookUrl) {
    return { status: 'skipped' };
  }

  const result = await sendFeishuPostMessage(
    config.feishuWebhookUrl,
    buildContactFeishuMessage(submission),
    config.feishuSignSecret,
  );

  if (!result.success) {
    return {
      status: 'failed',
      error: result.errorMessage || `飞书 HTTP ${result.status}`,
    };
  }

  return { status: 'success' };
}

async function sendQq(
  config: HomeContactChannelConfig,
  submission: ContactSubmission,
): Promise<{ status: ContactChannelStatus; error?: string }> {
  if (!config.qqUserId && !config.qqGroupId) {
    return { status: 'skipped' };
  }

  const client = createNapCatClient(config);
  const message = buildContactQqMessage(submission);
  const errors: string[] = [];

  if (config.qqUserId) {
    const result = await client.sendPrivateMessage({
      user_id: config.qqUserId,
      message,
    });

    if (result.status !== 'ok') {
      errors.push(
        result.message || result.wording || `QQ 私聊发送失败 (${result.retcode})`,
      );
    }
  }

  if (config.qqGroupId) {
    const result = await client.sendGroupMessage({
      group_id: config.qqGroupId,
      message,
    });

    if (result.status !== 'ok') {
      errors.push(
        result.message || result.wording || `QQ 群消息发送失败 (${result.retcode})`,
      );
    }
  }

  if (errors.length > 0) {
    return { status: 'failed', error: errors.join('；') };
  }

  return { status: 'success' };
}

export async function sendContactNotifications(
  submission: ContactSubmission,
): Promise<ContactNotifyResult> {
  const config = await getHomeContactChannelConfig();

  if (!hasAnyHomeContactChannel(config)) {
    return {
      ok: false,
      channels: { feishu: 'skipped', qq: 'skipped' },
      errors: ['未配置飞书 Webhook 或 QQ 通知渠道，请在首页配置页填写'],
    };
  }

  const [feishuResult, qqResult] = await Promise.all([
    sendFeishu(config, submission),
    sendQq(config, submission),
  ]);

  const errors = [feishuResult.error, qqResult.error].filter(
    (item): item is string => Boolean(item),
  );

  const attempted = [feishuResult.status, qqResult.status].filter(
    (status) => status !== 'skipped',
  );
  const succeeded = attempted.filter((status) => status === 'success');

  return {
    ok: attempted.length > 0 && succeeded.length > 0,
    channels: {
      feishu: feishuResult.status,
      qq: qqResult.status,
    },
    errors,
  };
}
