import type {
  ApiResponse,
  DocumentFormData,
  DocumentGraph,
  DocumentListItem,
  EdgeFormData,
  ImportMode,
  NodeFormData,
  NodeLinks,
  NodeNoteDocument,
  NodeNoteEdge,
  NodeNoteNode,
  ViewportState,
} from '../types';
import { nodeNotesApiPath } from '../utils/nodeNotesApiPath';

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  return res.json() as Promise<ApiResponse<T>>;
}

export const nodeNotesApi = {
  async listDocuments(): Promise<DocumentListItem[]> {
    const res = await fetch(nodeNotesApiPath('documents'));
    const json = await parseJson<DocumentListItem[]>(res);
    if (!json.success || !json.data) throw new Error(json.message || '加载文档失败');
    return json.data;
  },

  async createDocument(data: DocumentFormData): Promise<NodeNoteDocument> {
    const res = await fetch(nodeNotesApiPath('documents'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await parseJson<NodeNoteDocument>(res);
    if (!json.success || !json.data) throw new Error(json.message || '创建失败');
    return json.data;
  },

  async updateDocument(
    id: string,
    data: Partial<DocumentFormData> & { viewport?: ViewportState | null },
  ): Promise<NodeNoteDocument> {
    const res = await fetch(nodeNotesApiPath(`documents/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await parseJson<NodeNoteDocument>(res);
    if (!json.success || !json.data) throw new Error(json.message || '更新失败');
    return json.data;
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(nodeNotesApiPath(`documents/${id}`), { method: 'DELETE' });
    const json = await parseJson<{ deleted: boolean }>(res);
    if (!json.success) throw new Error(json.message || '删除失败');
  },

  async getGraph(id: string): Promise<DocumentGraph> {
    const res = await fetch(nodeNotesApiPath(`documents/${id}`));
    const json = await parseJson<DocumentGraph>(res);
    if (!json.success || !json.data) throw new Error(json.message || '加载图谱失败');
    return json.data;
  },

  async createNode(documentId: string, data: NodeFormData): Promise<NodeNoteNode> {
    const res = await fetch(nodeNotesApiPath(`documents/${documentId}/nodes`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await parseJson<NodeNoteNode>(res);
    if (!json.success || !json.data) throw new Error(json.message || '创建节点失败');
    return json.data;
  },

  async updateNode(id: string, data: Partial<NodeFormData>): Promise<NodeNoteNode> {
    const res = await fetch(nodeNotesApiPath(`nodes/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await parseJson<NodeNoteNode>(res);
    if (!json.success || !json.data) throw new Error(json.message || '更新节点失败');
    return json.data;
  },

  async deleteNode(id: string): Promise<void> {
    const res = await fetch(nodeNotesApiPath(`nodes/${id}`), { method: 'DELETE' });
    const json = await parseJson<{ deleted: boolean }>(res);
    if (!json.success) throw new Error(json.message || '删除节点失败');
  },

  async createEdge(documentId: string, data: EdgeFormData): Promise<NodeNoteEdge> {
    const res = await fetch(nodeNotesApiPath(`documents/${documentId}/edges`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await parseJson<NodeNoteEdge>(res);
    if (!json.success || !json.data) throw new Error(json.message || '创建边失败');
    return json.data;
  },

  async updateEdge(id: string, label: string | null): Promise<NodeNoteEdge> {
    const res = await fetch(nodeNotesApiPath(`edges/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    });
    const json = await parseJson<NodeNoteEdge>(res);
    if (!json.success || !json.data) throw new Error(json.message || '更新边失败');
    return json.data;
  },

  async deleteEdge(id: string): Promise<void> {
    const res = await fetch(nodeNotesApiPath(`edges/${id}`), { method: 'DELETE' });
    const json = await parseJson<{ deleted: boolean }>(res);
    if (!json.success) throw new Error(json.message || '删除边失败');
  },

  async getNodeLinks(nodeId: string): Promise<NodeLinks> {
    const res = await fetch(nodeNotesApiPath(`nodes/${nodeId}/links`));
    const json = await parseJson<NodeLinks>(res);
    if (!json.success || !json.data) throw new Error(json.message || '加载链接失败');
    return json.data;
  },

  async exportDocumentZip(documentId: string): Promise<void> {
    const res = await fetch(nodeNotesApiPath(`documents/${documentId}/export`));
    if (!res.ok) throw new Error('导出失败');
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match?.[1] || 'document.zip';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  async importFiles(
    files: File[],
    mode: ImportMode,
    targetDocumentId?: string,
  ): Promise<{ documentId: string; nodesCreated: number; edgesCreated: number }> {
    const form = new FormData();
    form.set('mode', mode);
    if (targetDocumentId) form.set('targetDocumentId', targetDocumentId);
    for (const file of files) form.append('files', file);

    const res = await fetch(nodeNotesApiPath('documents/import'), { method: 'POST', body: form });
    const json = await parseJson<{
      documentId: string;
      nodesCreated: number;
      edgesCreated: number;
    }>(res);
    if (!json.success || !json.data) throw new Error(json.message || '导入失败');
    return json.data;
  },
};
