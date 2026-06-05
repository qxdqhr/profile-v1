import type { HomePageConfig } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function fetchHomePageConfig(): Promise<HomePageConfig> {
  const response = await fetch('/api/homePage/config', {
    cache: 'no-store',
    credentials: 'include',
  });
  const json = (await response.json()) as ApiResponse<HomePageConfig>;

  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error || '加载首页配置失败');
  }

  return json.data;
}

export async function saveHomePageConfig(
  config: HomePageConfig,
): Promise<HomePageConfig> {
  const response = await fetch('/api/homePage/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(config),
  });

  const json = (await response.json()) as ApiResponse<HomePageConfig>;

  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error || '保存首页配置失败');
  }

  return json.data;
}
