import type { HomeContactConfig, HomePageConfig } from '../types';

function maskSecret(value: string | null): string | null {
  if (!value) return null;
  if (value.length <= 8) return '****';
  return `${value.slice(0, 4)}****${value.slice(-4)}`;
}

function maskWebhookUrl(value: string | null): string | null {
  if (!value) return null;
  if (value.length <= 16) return '****';
  return `${value.slice(0, 24)}****${value.slice(-4)}`;
}

export function maskContactConfig(
  contactConfig: HomeContactConfig,
): HomeContactConfig {
  return {
    feishuWebhookUrl: maskWebhookUrl(contactConfig.feishuWebhookUrl),
    feishuSignSecret: maskSecret(contactConfig.feishuSignSecret),
    qqUserId: contactConfig.qqUserId,
    qqGroupId: contactConfig.qqGroupId,
  };
}

export function maskHomePageConfigForAdmin(
  config: HomePageConfig,
): HomePageConfig {
  return {
    ...config,
    contactConfig: maskContactConfig(config.contactConfig),
  };
}

export function stripContactConfig(config: HomePageConfig): HomePageConfig {
  const { contactConfig: _contactConfig, ...rest } = config;
  return rest;
}

export function mergeContactConfigOnSave(
  existing: HomePageConfig,
  input: unknown,
): unknown {
  if (!input || typeof input !== 'object') {
    return input;
  }

  const source = input as Record<string, unknown>;
  const contactSource = source.contactConfig;
  if (!contactSource || typeof contactSource !== 'object') {
    return input;
  }

  const record = contactSource as Record<string, unknown>;
  const existingContact = existing.contactConfig;

  const nextWebhook = typeof record.feishuWebhookUrl === 'string'
    ? record.feishuWebhookUrl.trim()
    : record.feishuWebhookUrl === null
      ? null
      : undefined;

  const nextSecret = typeof record.feishuSignSecret === 'string'
    ? record.feishuSignSecret.trim()
    : record.feishuSignSecret === null
      ? null
      : undefined;

  const mergedContact: HomeContactConfig = {
    feishuWebhookUrl: nextWebhook !== undefined
      ? (
        nextWebhook
        && !nextWebhook.includes('****')
          ? nextWebhook
          : existingContact.feishuWebhookUrl
      )
      : existingContact.feishuWebhookUrl,
    feishuSignSecret: nextSecret !== undefined
      ? (
        nextSecret
        && !nextSecret.includes('****')
          ? nextSecret
          : existingContact.feishuSignSecret
      )
      : existingContact.feishuSignSecret,
    qqUserId: record.qqUserId !== undefined
      ? parseNullablePositiveInt(record.qqUserId)
      : existingContact.qqUserId,
    qqGroupId: record.qqGroupId !== undefined
      ? parseNullablePositiveInt(record.qqGroupId)
      : existingContact.qqGroupId,
  };

  return {
    ...source,
    contactConfig: mergedContact,
  };
}

function parseNullablePositiveInt(value: unknown): number | null {
  if (value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}
