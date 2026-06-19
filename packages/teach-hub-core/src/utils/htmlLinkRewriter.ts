/**
 * 改写 teach 课时 / 参考页 HTML 内的相对链接，使其在 teachHub 站内可导航。
 */

import { teachHubPublicBase } from './routes';

function workspaceBase(workspaceId: string): string {
  return `${teachHubPublicBase()}/w/${workspaceId}`;
}

function lessonHref(workspaceId: string, filename: string): string {
  const slug = filename.replace(/\.html$/i, '');
  return `${workspaceBase(workspaceId)}/lesson/${slug}`;
}

function referenceHref(workspaceId: string, filename: string): string {
  const slug = filename.replace(/\.html$/i, '');
  return `${workspaceBase(workspaceId)}/reference/${slug}`;
}

export function rewriteTeachHtmlLinks(html: string, workspaceId: string): string {
  const base = workspaceBase(workspaceId);

  let out = html;

  // href="../lessons/0001-foo.html"
  out = out.replace(
    /href=(["'])\.\.\/lessons\/([^"']+?)\1/gi,
    (_match, quote: string, file: string) => `href=${quote}${lessonHref(workspaceId, file)}${quote}`,
  );

  // href="../reference/foo.html"
  out = out.replace(
    /href=(["'])\.\.\/reference\/([^"']+?)\1/gi,
    (_match, quote: string, file: string) =>
      `href=${quote}${referenceHref(workspaceId, file)}${quote}`,
  );

  // href="../MISSION.md" / RESOURCES.md / NOTES.md
  out = out.replace(
    /href=(["'])\.\.\/MISSION\.md\1/gi,
    `href=$1${base}/mission$1`,
  );
  out = out.replace(
    /href=(["'])\.\.\/RESOURCES\.md\1/gi,
    `href=$1${base}/resources$1`,
  );
  out = out.replace(
    /href=(["'])\.\.\/NOTES\.md\1/gi,
    `href=$1${base}/notes$1`,
  );

  // 文档内相对路径（无 ../）
  out = out.replace(
    /href=(["'])lessons\/([^"']+?)\1/gi,
    (_match, quote: string, file: string) => `href=${quote}${lessonHref(workspaceId, file)}${quote}`,
  );
  out = out.replace(
    /href=(["'])reference\/([^"']+?)\1/gi,
    (_match, quote: string, file: string) =>
      `href=${quote}${referenceHref(workspaceId, file)}${quote}`,
  );

  // 课内链接在 iframe srcDoc 中应跳出到主窗口，避免嵌套整页
  if (!/<base\s/i.test(out)) {
    if (/<head[\s>]/i.test(out)) {
      out = out.replace(/<head([^>]*)>/i, '<head$1><base target="_top" href="/">');
    }
  }

  return out;
}

export function shouldRewriteHtml(relativePath: string): boolean {
  const normalized = relativePath.replaceAll('\\', '/');
  return (
    normalized.startsWith('lessons/') ||
    normalized.startsWith('reference/')
  ) && normalized.endsWith('.html');
}

export function contentTypeForPath(relativePath: string): string {
  if (relativePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (relativePath.endsWith('.md')) return 'text/markdown; charset=utf-8';
  if (relativePath.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'text/plain; charset=utf-8';
}
