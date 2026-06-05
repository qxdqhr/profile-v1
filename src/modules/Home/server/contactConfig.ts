export interface HomeContactChannelConfig {
  feishuWebhookUrl: string | null;
  feishuSignSecret: string | null;
  qqUserId: number | null;
  qqGroupId: number | null;
  napCatBaseUrl: string;
  napCatToken?: string;
  napCatTimeoutMs: number;
}

function parsePositiveInt(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export function getHomeContactChannelConfig(): HomeContactChannelConfig {
  return {
    feishuWebhookUrl: process.env.HOME_CONTACT_FEISHU_WEBHOOK_URL?.trim() || null,
    feishuSignSecret: process.env.HOME_CONTACT_FEISHU_SIGN_SECRET?.trim() || null,
    qqUserId: parsePositiveInt(process.env.HOME_CONTACT_QQ_USER_ID),
    qqGroupId: parsePositiveInt(process.env.HOME_CONTACT_QQ_GROUP_ID),
    napCatBaseUrl: process.env.NAPCAT_HTTP_URL?.trim() || 'http://127.0.0.1:3001',
    napCatToken: process.env.NAPCAT_TOKEN?.trim() || undefined,
    napCatTimeoutMs: Number(process.env.NAPCAT_TIMEOUT_MS || 12000),
  };
}

export function hasAnyHomeContactChannel(config: HomeContactChannelConfig): boolean {
  return Boolean(
    config.feishuWebhookUrl
    || config.qqUserId
    || config.qqGroupId,
  );
}
