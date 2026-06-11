import {
  DEFAULT_HOME_PAGE_CONFIG,
} from '../defaultConfig';
import type { HomePageConfig } from '../types';
import { readBusinessConfig, writeBusinessConfig } from '@/lib/config/business-config';
import { mergeContactConfigOnSave } from './homePageConfigSecrets';
import { normalizeHomePageConfig } from './normalizeHomePageConfig';

export async function getHomePageConfig(): Promise<HomePageConfig> {
  try {
    const business = readBusinessConfig();
    if (!business.homePage) {
      return DEFAULT_HOME_PAGE_CONFIG;
    }

    return normalizeHomePageConfig(business.homePage);
  } catch (error) {
    console.error('[homePageConfig] load failed, fallback to default:', error);
    return DEFAULT_HOME_PAGE_CONFIG;
  }
}

export async function saveHomePageConfig(input: unknown): Promise<HomePageConfig> {
  const existing = await getHomePageConfig();
  const merged = mergeContactConfigOnSave(existing, input);
  const normalized = normalizeHomePageConfig(merged);

  writeBusinessConfig((business) => ({
    ...business,
    homePage: normalized as Record<string, unknown>,
  }));

  return normalized;
}
