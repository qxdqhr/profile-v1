const DEFAULT_NODE_NOTES_APP_URL = 'http://localhost:3005';
const GATEWAY_NODE_NOTES_PATH = '/node-notes';

function joinAppPath(base: string, path: string): string {
  const normalizedBase = base.replace(/\/$/, '');
  if (path === '/' || path === '') return normalizedBase || '/';
  return `${normalizedBase}${path.startsWith('/') ? path : `/${path}`}`;
}

function resolveNodeNotesBase(): string {
  const explicit = process.env.NEXT_PUBLIC_NODE_NOTES_URL?.trim();
  if (explicit) return explicit;
  if (process.env.NODE_ENV === 'production') return GATEWAY_NODE_NOTES_PATH;
  return DEFAULT_NODE_NOTES_APP_URL;
}

/** node-notes 子应用根 URL（本地默认 :3005；网关模式 `/node-notes`） */
export function getNodeNotesAppUrl(path = '/'): string {
  return joinAppPath(resolveNodeNotesBase(), path);
}
