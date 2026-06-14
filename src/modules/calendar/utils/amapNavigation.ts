const SOURCE_APPLICATION = 'profile-v1';

/**
 * 根据地点名称构建高德导航链接。
 * Android 使用官方关键词路线规划；iOS / 其他移动端使用 URI API 并尝试调起 App。
 */
export function buildAmapNavigationUrl(location: string): string {
  const keyword = encodeURIComponent(location.trim());

  if (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)) {
    return `androidamap://keywordNavi?sourceApplication=${encodeURIComponent(SOURCE_APPLICATION)}&keyword=${keyword}&style=2`;
  }

  return `https://uri.amap.com/navigation?to=,,${keyword}&mode=car&callnative=1`;
}

/**
 * 使用地点名称唤起高德地图导航（活动仅保存文本地点，无经纬度）。
 */
export function openAmapNavigation(location: string): void {
  const trimmed = location.trim();
  if (!trimmed || typeof window === 'undefined') return;

  const url = buildAmapNavigationUrl(trimmed);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.assign(url);
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
