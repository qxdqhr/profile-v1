import type { PromptKind } from '../types';

export type ImportedTemplate = {
  name: string;
  kind: PromptKind;
  separator: string;
  description?: string;
  /** 每条提示词文本 */
  prompts: string[];
};

export function splitTemplateText(
  text: string,
  separator = ', ',
): string[] {
  if (!text.trim()) return [];
  const parts = text.split(separator).map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) return parts;
  return text
    .split(/[,，;\n]+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function parseTemplateImport(raw: string): ImportedTemplate {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('导入内容为空');

  try {
    const json = JSON.parse(trimmed) as Record<string, unknown>;
    const name = String(json.name ?? '导入模板').trim();
    const kind = (json.kind === 'negative' ? 'negative' : 'positive') as PromptKind;
    const separator = String(json.separator ?? ', ');
    const description = json.description ? String(json.description) : undefined;

    if (Array.isArray(json.prompts)) {
      return {
        name,
        kind,
        separator,
        description,
        prompts: json.prompts.map((p) => String(p).trim()).filter(Boolean),
      };
    }

    const content = String(json.content ?? json.text ?? '').trim();
    if (!content) throw new Error('模板 JSON 需包含 prompts 数组或 content 字段');
    return {
      name,
      kind,
      separator,
      description,
      prompts: splitTemplateText(content, separator),
    };
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('模板')) throw e;
    return {
      name: '导入模板',
      kind: 'positive',
      separator: ', ',
      prompts: splitTemplateText(trimmed),
    };
  }
}
