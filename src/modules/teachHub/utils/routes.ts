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
