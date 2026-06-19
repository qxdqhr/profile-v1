import type { ResourceItem, ResourcesFormData } from '../types';

const PLACEHOLDER_RE = /^（.+）$/;

function parseListItem(line: string): ResourceItem | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('- ')) return null;
  const body = trimmed.slice(2).trim();
  if (!body || PLACEHOLDER_RE.test(body)) return null;

  const linkMatch = body.match(/^\[([^\]]+)\]\(([^)]+)\)(?:\s*[—–-]\s*(.+))?$/);
  if (linkMatch) {
    return {
      title: linkMatch[1].trim(),
      url: linkMatch[2].trim(),
      note: linkMatch[3]?.trim() || undefined,
    };
  }

  const urlMatch = body.match(/^(.+?)\s+(https?:\/\/\S+)(?:\s*[—–-]\s*(.+))?$/);
  if (urlMatch) {
    return {
      title: urlMatch[1].trim(),
      url: urlMatch[2].trim(),
      note: urlMatch[3]?.trim() || undefined,
    };
  }

  const noteMatch = body.match(/^(.+?)\s*[—–-]\s*(.+)$/);
  if (noteMatch) {
    return { title: noteMatch[1].trim(), note: noteMatch[2].trim() };
  }

  return { title: body };
}

function readSectionList(content: string, aliases: string[]): ResourceItem[] {
  const sectionPattern = /^##\s+(.+)$/gm;
  const sections: Array<{ name: string; start: number; end: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = sectionPattern.exec(content)) !== null) {
    sections.push({
      name: match[1].trim().toLowerCase(),
      start: match.index + match[0].length,
      end: content.length,
    });
  }
  for (let i = 0; i < sections.length; i += 1) {
    sections[i].end = i + 1 < sections.length ? sections[i + 1].start : content.length;
  }

  const section = sections.find((s) => aliases.some((a) => s.name.includes(a)));
  if (!section) return [];

  const body = content.slice(section.start, section.end);
  const items = body
    .split('\n')
    .map(parseListItem)
    .filter((item): item is ResourceItem => item !== null);

  if (items.length > 0) return items;

  const paragraph = body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !PLACEHOLDER_RE.test(line))
    .join('\n');

  return paragraph ? [{ title: paragraph }] : [];
}

export function parseResourcesMarkdown(content: string): ResourcesFormData {
  return {
    knowledge: readSectionList(content, ['knowledge', '知识']),
    communities: readSectionList(content, ['wisdom', 'communities', '社区']),
  };
}

function formatListItem(item: ResourceItem): string {
  const title = item.title.trim();
  const url = item.url?.trim();
  const note = item.note?.trim();

  if (url) {
    const link = `[${title}](${url})`;
    return note ? `- ${link} — ${note}` : `- ${link}`;
  }
  return note ? `- ${title} — ${note}` : `- ${title}`;
}

function formatSection(title: string, items: ResourceItem[]): string[] {
  const lines = [`## ${title}`, ''];
  const valid = items.filter((item) => item.title.trim());
  if (valid.length === 0) {
    lines.push('（暂无条目）', '');
  } else {
    lines.push(...valid.map(formatListItem), '');
  }
  return lines;
}

export function composeResourcesMarkdown(data: ResourcesFormData): string {
  const lines = [
    '# 学习资源',
    '',
    ...formatSection('Knowledge', data.knowledge),
    ...formatSection('Wisdom (Communities)', data.communities),
  ];
  return lines.join('\n');
}

export const EMPTY_RESOURCE_ITEM: ResourceItem = { title: '', url: '', note: '' };
