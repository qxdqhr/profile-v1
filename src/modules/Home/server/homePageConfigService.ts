import { configDbService } from '@/modules/configManager/db/configDbService';
import {
  DEFAULT_HOME_PAGE_CONFIG,
  HOME_PAGE_CONFIG_KEY,
} from '../defaultConfig';
import type { HomePageConfig } from '../types';
import { mergeContactConfigOnSave } from './homePageConfigSecrets';
import { normalizeHomePageConfig } from './normalizeHomePageConfig';

export async function getHomePageConfig(): Promise<HomePageConfig> {
  try {
    const item = await configDbService.getConfigItemByKey(HOME_PAGE_CONFIG_KEY);
    if (!item?.value) {
      return DEFAULT_HOME_PAGE_CONFIG;
    }

    let parsed: unknown = {};
    try {
      parsed = JSON.parse(item.value);
    } catch {
      parsed = {};
    }

    return normalizeHomePageConfig(parsed);
  } catch (error) {
    console.error('[homePageConfig] load failed, fallback to default:', error);
    return DEFAULT_HOME_PAGE_CONFIG;
  }
}

export async function saveHomePageConfig(input: unknown): Promise<HomePageConfig> {
  const existing = await getHomePageConfig();
  const merged = mergeContactConfigOnSave(existing, input);
  const normalized = normalizeHomePageConfig(merged);
  const value = JSON.stringify(normalized, null, 2);
  const existingItem = await configDbService.getConfigItemByKey(HOME_PAGE_CONFIG_KEY);

  if (existingItem) {
    await configDbService.updateConfigItemByKey(HOME_PAGE_CONFIG_KEY, { value });
  } else {
    await configDbService.createConfigItem({
      categoryId: null,
      key: HOME_PAGE_CONFIG_KEY,
      displayName: '首页配置',
      description: '个人主页 Hero、导航、时间线、技能球与项目展示配置',
      value,
      defaultValue: JSON.stringify(DEFAULT_HOME_PAGE_CONFIG, null, 2),
      type: 'json',
      isRequired: false,
      isSensitive: false,
      validation: null,
      sortOrder: 0,
      isActive: true,
    });
  }

  return normalized;
}
