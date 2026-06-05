import { getHomePageConfig } from './homePageConfigService';

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

function getEnvHomeContactChannelConfig(): HomeContactChannelConfig {
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

export async function getHomeContactChannelConfig(): Promise<HomeContactChannelConfig> {
  const envConfig = getEnvHomeContactChannelConfig();

  try {
    const pageConfig = await getHomePageConfig();
    const stored = pageConfig.contactConfig;

    return {
      feishuWebhookUrl: stored.feishuWebhookUrl || envConfig.feishuWebhookUrl,
      feishuSignSecret: stored.feishuSignSecret || envConfig.feishuSignSecret,
      qqUserId: stored.qqUserId ?? envConfig.qqUserId,
      qqGroupId: stored.qqGroupId ?? envConfig.qqGroupId,
      napCatBaseUrl: envConfig.napCatBaseUrl,
      napCatToken: envConfig.napCatToken,
      napCatTimeoutMs: envConfig.napCatTimeoutMs,
    };
  } catch (error) {
    console.error('[homeContact] load config from DB failed, fallback to env:', error);
    return envConfig;
  }
}

export function hasAnyHomeContactChannel(config: HomeContactChannelConfig): boolean {
  return Boolean(
    config.feishuWebhookUrl
    || config.qqUserId
    || config.qqGroupId,
  );
}
