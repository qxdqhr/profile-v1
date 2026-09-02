export function apiPath(path: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
