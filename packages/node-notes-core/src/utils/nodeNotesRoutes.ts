/**
 * 节点笔记页面路由（主站实验田嵌入 vs 独立子应用）。
 *
 * - 主站 web：设置 NEXT_PUBLIC_NODE_NOTES_EMBED_PATH=/testField/nodeNotes
 * - 子应用 node-notes：不设置，使用相对根路径 / 与 /[documentId]
 */
export function getNodeNotesBasePath(): string {
  const embed = process.env.NEXT_PUBLIC_NODE_NOTES_EMBED_PATH;
  if (embed !== undefined && embed !== '') {
    return embed.replace(/\/$/, '');
  }
  return '';
}

export function nodeNotesGalleryPath(): string {
  const base = getNodeNotesBasePath();
  return base || '/';
}

export function nodeNotesDocumentPath(documentId: string): string {
  const base = getNodeNotesBasePath();
  return base ? `${base}/${documentId}` : `/${documentId}`;
}

export function getTestFieldPath(): string {
  return process.env.NEXT_PUBLIC_TEST_FIELD_PATH ?? '/testField';
}
