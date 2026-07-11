import { NodeNotesCanvasPage } from '@/modules/nodeNotes';

export default async function NodeNotesDocumentRoute({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  return <NodeNotesCanvasPage documentId={documentId} />;
}
