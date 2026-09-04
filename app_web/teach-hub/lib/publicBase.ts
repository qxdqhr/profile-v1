/** 浏览器地址栏可见前缀（HTML 内链；含子应用 basePath） */
export function teachHubPublicBase(): string {
  if (typeof process === 'undefined') return '';
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').trim().replace(/\/+$/, '');
  if (basePath) return basePath;
  const raw = process.env.NEXT_PUBLIC_TEACH_HUB_BASE_URL;
  if (raw === undefined) return '';
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === '/') return '';
  return trimmed.replace(/\/+$/, '');
}
