import type { ResourceItem } from '../types';
import { extractExtendedReadingLinks } from '../utils/lessonExtendedReadingParser';
import {
  composeResourcesMarkdown,
  parseResourcesMarkdown,
} from '../utils/resourcesParser';
import { lessonTitleFromSlug } from '../utils/routes';
import {
  parseWorkspaceMetaJson,
  WORKSPACE_META_PATH,
} from '../utils/workspaceMeta';
import { DEFAULT_RESOURCES_MD } from '../utils/workspaceTemplates';
import { putWorkspaceFileText, readWorkspaceFileText } from './teachHubFileStore';

function normalizeUrl(url: string): string {
  try {
    return new URL(url.trim()).href.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

function existingUrls(items: ResourceItem[]): Set<string> {
  const set = new Set<string>();
  for (const item of items) {
    if (item.url?.trim()) {
      set.add(normalizeUrl(item.url));
    }
  }
  return set;
}

export async function isAutoSyncLessonResourcesEnabled(
  userId: string,
  workspaceId: string,
): Promise<boolean> {
  try {
    const raw = await readWorkspaceFileText(userId, workspaceId, WORKSPACE_META_PATH);
    return parseWorkspaceMetaJson(raw).autoSyncLessonResources === true;
  } catch {
    return false;
  }
}

export type SyncLessonResourcesResult = {
  added: number;
  skipped: number;
};

/** 将课时 HTML 中「延伸阅读」外链合并进 RESOURCES.md（Knowledge 区，按 URL 去重） */
export async function syncLessonExtendedReadingToResources(input: {
  userId: string;
  workspaceId: string;
  lessonSlug: string;
  lessonHtml: string;
}): Promise<SyncLessonResourcesResult> {
  const links = extractExtendedReadingLinks(input.lessonHtml);
  if (links.length === 0) {
    return { added: 0, skipped: 0 };
  }

  let resourcesMd: string;
  try {
    resourcesMd = await readWorkspaceFileText(
      input.userId,
      input.workspaceId,
      'RESOURCES.md',
    );
  } catch {
    resourcesMd = DEFAULT_RESOURCES_MD;
  }

  const parsed = parseResourcesMarkdown(resourcesMd);
  const known = existingUrls(parsed.items);
  const lessonLabel = lessonTitleFromSlug(input.lessonSlug);
  let added = 0;
  let skipped = 0;

  for (const link of links) {
    const key = normalizeUrl(link.url);
    if (known.has(key)) {
      skipped += 1;
      continue;
    }
    known.add(key);
    parsed.items.push({
      title: link.title,
      url: link.url,
      note: `来自课时：${lessonLabel}`,
      category: 'knowledge',
    });
    added += 1;
  }

  if (added === 0) {
    return { added, skipped };
  }

  await putWorkspaceFileText({
    userId: input.userId,
    workspaceId: input.workspaceId,
    relativePath: 'RESOURCES.md',
    content: composeResourcesMarkdown(parsed),
    uploaderId: input.userId,
  });

  return { added, skipped };
}
