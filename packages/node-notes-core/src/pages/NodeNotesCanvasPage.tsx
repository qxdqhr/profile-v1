'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Download,
  FileUp,
  ImageDown,
  Loader2,
  Plus,
  Save,
} from 'lucide-react';
import { AuthGuard, AuthProvider } from '@profile/auth/react';
import { nodeNotesDocumentPath, nodeNotesGalleryPath } from '../utils/nodeNotesRoutes';
import { NoteNode, type NoteNodeData } from '../components/NoteNode';
import { NodeEditorPanel } from '../components/NodeEditorPanel';
import { EdgeStylePanel } from '../components/EdgeStylePanel';
import { nodeNotesApi } from '../services/nodeNotesApi';
import type { DocumentGraph, NodeNoteEdge, NodeNoteNode, ViewportState } from '../types';
import { exportCanvasPng } from '../utils/exportCanvasPng';
import { DEFAULT_EDGE_COLOR, normalizeHexColor } from '../utils/nodeStyle';
import '../styles/node-notes-theme.css';

const nodeTypes = { note: NoteNode };

function toFlowNode(node: NodeNoteNode, selected: boolean): Node<NoteNodeData> {
  return {
    id: node.id,
    type: 'note',
    position: { x: node.positionX, y: node.positionY },
    data: { node, selected },
    style: { width: node.width },
  };
}

function toFlowEdge(edge: NodeNoteEdge, selected = false): Edge {
  const color = normalizeHexColor(edge.color, DEFAULT_EDGE_COLOR);
  return {
    id: edge.id,
    source: edge.sourceId,
    target: edge.targetId,
    label: edge.label || undefined,
    selected,
    markerEnd: { type: MarkerType.ArrowClosed, color },
    style: { stroke: color, strokeWidth: selected ? 3 : 2 },
    labelStyle: { fill: color, fontSize: 11 },
  };
}

interface NodeNotesCanvasPageProps {
  documentId: string;
}

function CanvasInner({ documentId }: NodeNotesCanvasPageProps) {
  const router = useRouter();
  const flowRef = useRef<HTMLDivElement>(null);
  const flowInstance = useRef<ReactFlowInstance | null>(null);
  const [graph, setGraph] = useState<DocumentGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [exportingPng, setExportingPng] = useState(false);
  const [importing, setImporting] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NoteNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const contentTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const positionTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const edgeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const fitCanvas = useCallback((nodeId?: string) => {
    requestAnimationFrame(() => {
      if (nodeId) {
        flowInstance.current?.fitView({ nodes: [{ id: nodeId }], padding: 0.35, duration: 300 });
      } else {
        flowInstance.current?.fitView({ padding: 0.2, duration: 300 });
      }
    });
  }, []);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    try {
      const data = await nodeNotesApi.getGraph(documentId);
      setGraph(data);
      setNodes(data.nodes.map((n) => toFlowNode(n, false)));
      setEdges(data.edges.map((e) => toFlowEdge(e, false)));
      fitCanvas();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [documentId, setNodes, setEdges, fitCanvas]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId || !graph) return null;
    return graph.nodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [graph, selectedNodeId]);

  const selectedEdge = useMemo(() => {
    if (!selectedEdgeId || !graph) return null;
    return graph.edges.find((e) => e.id === selectedEdgeId) ?? null;
  }, [graph, selectedEdgeId]);

  const scheduleContentSave = useCallback((nodeId: string, patch: Partial<NodeNoteNode>) => {
    setSaveState('saving');
    const prev = contentTimers.current.get(nodeId);
    if (prev) clearTimeout(prev);
    const timer = setTimeout(async () => {
      try {
        const updated = await nodeNotesApi.updateNode(nodeId, {
          title: patch.title,
          contentMd: patch.contentMd,
          bgColor: patch.bgColor,
          textColor: patch.textColor,
        });
        setGraph((g) =>
          g
            ? {
                ...g,
                nodes: g.nodes.map((n) => (n.id === nodeId ? { ...n, ...updated } : n)),
              }
            : g,
        );
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, node: { ...n.data.node, ...updated } } }
              : n,
          ),
        );
        setSaveState('saved');
      } catch (e) {
        setSaveState('error');
        toast.error(e instanceof Error ? e.message : '保存失败');
      }
    }, 800);
    contentTimers.current.set(nodeId, timer);
  }, [setNodes]);

  const schedulePositionSave = useCallback(
    (nodeId: string, x: number, y: number) => {
      setSaveState('saving');
      const prev = positionTimers.current.get(nodeId);
      if (prev) clearTimeout(prev);
      const timer = setTimeout(async () => {
        try {
          await nodeNotesApi.updateNode(nodeId, { positionX: x, positionY: y });
          setSaveState('saved');
        } catch {
          setSaveState('error');
        }
      }, 500);
      positionTimers.current.set(nodeId, timer);
    },
    [],
  );

  const handleNodeChange = useCallback(
    (patch: Partial<Pick<NodeNoteNode, 'title' | 'contentMd' | 'bgColor' | 'textColor'>>) => {
      if (!selectedNodeId) return;
      setGraph((g) =>
        g
          ? {
              ...g,
              nodes: g.nodes.map((n) =>
                n.id === selectedNodeId ? { ...n, ...patch } : n,
              ),
            }
          : g,
      );
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  node: { ...n.data.node, ...patch },
                  selected: true,
                },
              }
            : n,
        ),
      );
      scheduleContentSave(selectedNodeId, patch);
    },
    [selectedNodeId, scheduleContentSave, setNodes],
  );

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) {
        toast.error('不能创建自环有向边');
        return;
      }
      try {
        const edge = await nodeNotesApi.createEdge(documentId, {
          sourceId: connection.source,
          targetId: connection.target,
        });
        setEdges((eds) => addEdge(toFlowEdge(edge, false), eds));
        setGraph((g) => (g ? { ...g, edges: [...g.edges, edge] } : g));
        toast.success('已创建有向边');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '连线失败');
      }
    },
    [documentId, setEdges],
  );

  const scheduleEdgeSave = useCallback(
    (edgeId: string, patch: Partial<Pick<NodeNoteEdge, 'label' | 'color'>>) => {
      setSaveState('saving');
      const prev = edgeTimers.current.get(edgeId);
      if (prev) clearTimeout(prev);
      const timer = setTimeout(async () => {
        try {
          const updated = await nodeNotesApi.updateEdge(edgeId, patch);
          setGraph((g) =>
            g
              ? {
                  ...g,
                  edges: g.edges.map((e) => (e.id === edgeId ? { ...e, ...updated } : e)),
                }
              : g,
          );
          setEdges((eds) =>
            eds.map((e) => (e.id === edgeId ? toFlowEdge(updated, true) : e)),
          );
          setSaveState('saved');
        } catch (e) {
          setSaveState('error');
          toast.error(e instanceof Error ? e.message : '保存失败');
        }
      }, 400);
      edgeTimers.current.set(edgeId, timer);
    },
    [setEdges],
  );

  const handleEdgeChange = useCallback(
    (patch: Partial<Pick<NodeNoteEdge, 'label' | 'color'>>) => {
      if (!selectedEdgeId || !graph) return;
      setGraph((g) =>
        g
          ? {
              ...g,
              edges: g.edges.map((e) => (e.id === selectedEdgeId ? { ...e, ...patch } : e)),
            }
          : g,
      );
      const edge = graph.edges.find((e) => e.id === selectedEdgeId);
      if (edge) {
        const merged = { ...edge, ...patch };
        setEdges((eds) =>
          eds.map((e) => (e.id === selectedEdgeId ? toFlowEdge(merged, true) : { ...e, selected: false })),
        );
      }
      scheduleEdgeSave(selectedEdgeId, patch);
    },
    [selectedEdgeId, graph, scheduleEdgeSave, setEdges],
  );

  const handleAddNode = useCallback(async () => {
    try {
      const node = await nodeNotesApi.createNode(documentId, {
        title: '新节点',
        contentMd: '',
        positionX: 120 + Math.random() * 80,
        positionY: 120 + Math.random() * 80,
      });
      setGraph((g) => (g ? { ...g, nodes: [...g.nodes, node] } : g));
      setNodes((nds) => [...nds, toFlowNode(node, false)]);
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
      fitCanvas(node.id);
      toast.success('已添加节点');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '添加失败');
    }
  }, [documentId, setNodes, fitCanvas]);

  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node<NoteNodeData>) => {
      schedulePositionSave(node.id, node.position.x, node.position.y);
    },
    [schedulePositionSave],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<NoteNodeData>) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, selected: n.id === node.id },
      })),
    );
    setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
  }, [setNodes, setEdges]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, selected: false },
      })),
    );
    setEdges((eds) =>
      eds.map((e) => {
        const graphEdge = graph?.edges.find((ge) => ge.id === e.id);
        if (!graphEdge) return { ...e, selected: e.id === edge.id };
        return toFlowEdge(graphEdge, e.id === edge.id);
      }),
    );
  }, [graph, setNodes, setEdges]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, selected: false } })));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: false, style: { ...e.style, strokeWidth: 2 } })));
  }, [setNodes, setEdges]);

  const handleDeleteSelected = useCallback(async () => {
    if (!selectedNodeId) return;
    if (!confirm('确定删除该节点？关联的有向边将一并删除。')) return;
    try {
      await nodeNotesApi.deleteNode(selectedNodeId);
      setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId),
      );
      setGraph((g) =>
        g
          ? {
              ...g,
              nodes: g.nodes.filter((n) => n.id !== selectedNodeId),
              edges: g.edges.filter(
                (e) => e.sourceId !== selectedNodeId && e.targetId !== selectedNodeId,
              ),
            }
          : g,
      );
      setSelectedNodeId(null);
      toast.success('节点已删除');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败');
    }
  }, [selectedNodeId, setNodes, setEdges]);

  const handleDeleteEdge = useCallback(async () => {
    if (!selectedEdgeId) return;
    if (!confirm('确定删除该连接线？')) return;
    try {
      await nodeNotesApi.deleteEdge(selectedEdgeId);
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
      setGraph((g) =>
        g ? { ...g, edges: g.edges.filter((e) => e.id !== selectedEdgeId) } : g,
      );
      setSelectedEdgeId(null);
      toast.success('连接线已删除');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败');
    }
  }, [selectedEdgeId, setEdges]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        handleDeleteSelected();
      }
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleDeleteSelected]);

  const persistViewport = useCallback(
    async (viewport: ViewportState) => {
      try {
        await nodeNotesApi.updateDocument(documentId, { viewport });
      } catch {
        // non-blocking
      }
    },
    [documentId],
  );

  const handleExportMd = useCallback(async () => {
    try {
      await nodeNotesApi.exportDocumentZip(documentId);
      toast.success('Markdown 包已下载');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '导出失败');
    }
  }, [documentId]);

  const handleImportMd = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip,.md';
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      if (!files.length) return;
      setImporting(true);
      try {
        const isZip = files.length === 1 && files[0].name.endsWith('.zip');
        const result = await nodeNotesApi.importFiles(
          files,
          isZip ? 'merge' : 'merge',
          documentId,
        );
        if (result.documentId !== documentId) {
          router.push(nodeNotesDocumentPath(result.documentId));
        } else {
          await loadGraph();
        }
        toast.success(`导入完成：${result.nodesCreated} 个节点`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '导入失败');
      } finally {
        setImporting(false);
      }
    };
    input.click();
  }, [documentId, loadGraph, router]);

  const handleExportPng = useCallback(
    async (mode: 'viewport' | 'full') => {
      if (!flowRef.current || !graph) return;
      if (mode === 'full' && graph.nodes.length > 100) {
        if (!confirm('节点较多，完整画布导出可能较慢，是否继续？')) return;
      }
      setExportingPng(true);
      try {
        const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
        await exportCanvasPng(flowRef.current, `${graph.document.slug}-${stamp}.png`, mode);
        toast.success('PNG 已下载');
      } catch {
        toast.error('图片导出失败');
      } finally {
        setExportingPng(false);
      }
    },
    [graph],
  );

  const focusNode = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, selected: n.id === nodeId },
          selected: n.id === nodeId,
        })),
      );
    },
    [setNodes],
  );

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--nn-shell-bg)] text-[var(--nn-shell-text)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--nn-primary)]" aria-label="加载中" />
      </div>
    );
  }

  if (!graph) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--nn-shell-bg)] text-[var(--nn-shell-text)]">
        <p>文档不存在或无法加载</p>
        <Link href={nodeNotesGalleryPath()} className="text-[var(--nn-accent)] underline">
          返回文档列表
        </Link>
      </div>
    );
  }

  const saveLabel =
    saveState === 'saving' ? '保存中…' : saveState === 'error' ? '保存失败' : '已保存';

  return (
    <div className="node-notes-root flex min-h-dvh flex-col bg-[var(--nn-shell-bg)]">
      <header className="flex flex-wrap items-center gap-2 border-b border-[var(--nn-shell-border)] px-3 py-2 sm:px-4">
        <Link
          href={nodeNotesGalleryPath()}
          className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-[var(--nn-shell-muted)] transition-colors duration-200 hover:bg-[var(--nn-shell-surface)] hover:text-[var(--nn-shell-text)]"
          aria-label="返回文档列表"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-[var(--nn-shell-text)] sm:text-lg">
          {graph.document.title}
        </h1>
        <span className="flex items-center gap-1 text-xs text-[var(--nn-shell-muted)]">
          <Save className="h-3.5 w-3.5" aria-hidden />
          {saveLabel}
        </span>
        <button
          type="button"
          onClick={handleAddNode}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--nn-primary)] px-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-[var(--nn-primary-hover)]"
        >
          <Plus className="h-4 w-4" aria-hidden />
          节点
        </button>
        <button
          type="button"
          onClick={handleImportMd}
          disabled={importing}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--nn-shell-border)] px-3 text-sm text-[var(--nn-shell-text)] transition-colors duration-200 hover:bg-[var(--nn-shell-surface)] disabled:opacity-50"
        >
          {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
          导入
        </button>
        <button
          type="button"
          onClick={handleExportMd}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--nn-shell-border)] px-3 text-sm text-[var(--nn-shell-text)] transition-colors duration-200 hover:bg-[var(--nn-shell-surface)]"
        >
          <Download className="h-4 w-4" aria-hidden />
          导出 MD
        </button>
        <div className="relative group">
          <button
            type="button"
            disabled={exportingPng}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--nn-shell-border)] px-3 text-sm text-[var(--nn-shell-text)] transition-colors duration-200 hover:bg-[var(--nn-shell-surface)] disabled:opacity-50"
          >
            {exportingPng ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageDown className="h-4 w-4" aria-hidden />
            )}
            导出图片
          </button>
          <div className="absolute right-0 top-full z-20 hidden min-w-[140px] rounded-lg border border-[var(--nn-shell-border)] bg-[var(--nn-shell-surface)] py-1 shadow-lg group-focus-within:block group-hover:block">
            <button
              type="button"
              onClick={() => handleExportPng('viewport')}
              className="block min-h-11 w-full cursor-pointer px-3 text-left text-sm hover:bg-[var(--nn-shell-bg)]"
            >
              当前视口
            </button>
            <button
              type="button"
              onClick={() => handleExportPng('full')}
              className="block min-h-11 w-full cursor-pointer px-3 text-left text-sm hover:bg-[var(--nn-shell-bg)]"
            >
              完整画布
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div ref={flowRef} className="relative h-[min(70dvh,720px)] min-h-[360px] w-full flex-1 bg-[var(--nn-canvas-bg)] lg:h-auto lg:min-h-0">
          <ReactFlow
            className="h-full w-full"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onNodeDragStop={handleNodeDragStop}
            onInit={(instance) => {
              flowInstance.current = instance;
            }}
            onMoveEnd={(_, viewport) =>
              persistViewport({ x: viewport.x, y: viewport.y, zoom: viewport.zoom })
            }
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.25}
            maxZoom={2}
            nodesDraggable
            nodesConnectable
            elementsSelectable
            edgesFocusable
            defaultEdgeOptions={{
              markerEnd: { type: MarkerType.ArrowClosed, color: DEFAULT_EDGE_COLOR },
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="var(--nn-canvas-grid)" gap={20} />
            <Controls className="!rounded-lg !border-slate-200 !shadow-sm" />
            <MiniMap
              className="!rounded-lg !border-slate-200 !shadow-sm"
              nodeColor="#7c3aed"
              maskColor="rgba(0,0,0,0.08)"
            />
            <Panel position="top-left" className="rounded-lg bg-white/90 px-2 py-1 text-xs text-slate-600 shadow-sm">
              点击节点/连接线设置样式 · 从右侧圆点拖向左侧圆点建边 →
            </Panel>
          </ReactFlow>
        </div>

        {selectedEdge ? (
          <EdgeStylePanel
            edge={selectedEdge}
            onChange={handleEdgeChange}
            onDelete={handleDeleteEdge}
          />
        ) : selectedNode ? (
          <NodeEditorPanel
            node={selectedNode}
            onChange={handleNodeChange}
            onFocusNode={focusNode}
          />
        ) : (
          <aside className="hidden w-80 items-center justify-center border-l border-[var(--nn-shell-border)] bg-[var(--nn-shell-surface)] p-6 text-sm text-[var(--nn-shell-muted)] lg:flex">
            点击节点或连接线以编辑内容与样式
          </aside>
        )}
      </div>
    </div>
  );
}

export default function NodeNotesCanvasPage({ documentId }: NodeNotesCanvasPageProps) {
  return (
    <AuthProvider>
      <AuthGuard>
        <CanvasInner documentId={documentId} />
      </AuthGuard>
    </AuthProvider>
  );
}
