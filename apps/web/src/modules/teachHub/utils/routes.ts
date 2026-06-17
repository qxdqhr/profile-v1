export const TEACH_HUB_BASE = '/testField/teachHub';

export function workspacePath(workspaceId: string): string {
  return `${TEACH_HUB_BASE}/w/${workspaceId}`;
}

export function lessonPath(workspaceId: string, slug: string): string {
  return `${workspacePath(workspaceId)}/lesson/${slug}`;
}

export function referencePath(workspaceId: string, slug: string): string {
  return `${workspacePath(workspaceId)}/reference/${slug}`;
}

export type WorkspaceTabId = 'overview' | 'mission' | 'records' | 'resources' | 'settings';

export const WORKSPACE_TABS: Array<{
  id: WorkspaceTabId;
  label: string;
  path: (workspaceId: string) => string;
}> = [
  { id: 'overview', label: '概览', path: workspacePath },
  { id: 'mission', label: 'Mission', path: (id) => `${workspacePath(id)}/mission` },
  { id: 'records', label: '学习记录', path: (id) => `${workspacePath(id)}/records` },
  { id: 'resources', label: '资源', path: (id) => `${workspacePath(id)}/resources` },
  { id: 'settings', label: '设置', path: (id) => `${workspacePath(id)}/settings` },
];

export function resolveWorkspaceTab(pathname: string, workspaceId: string): WorkspaceTabId {
  const base = workspacePath(workspaceId);
  if (pathname === base || pathname === `${base}/`) return 'overview';
  if (pathname.startsWith(`${base}/mission`)) return 'mission';
  if (pathname.startsWith(`${base}/records`)) return 'records';
  if (pathname.startsWith(`${base}/resources`)) return 'resources';
  if (pathname.startsWith(`${base}/settings`)) return 'settings';
  return 'overview';
}

export function lessonTitleFromSlug(slug: string): string {
  const parts = slug.split('-');
  if (parts.length > 1 && /^\d{4}$/.test(parts[0])) {
    return parts.slice(1).join(' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return slug;
}

export function lessonFilenameFromSlug(slug: string): string {
  return slug.endsWith('.html') ? slug : `${slug}.html`;
}
