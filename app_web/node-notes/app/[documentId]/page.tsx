import NodeNotesAuthShell from '../../lib/NodeNotesAuthShell';
import { NodeNotesCanvasPage } from 'sa2kit/business/nodeNotes/ui/web';

export default async function NodeNotesDocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  return (
    <NodeNotesAuthShell>
      <NodeNotesCanvasPage documentId={documentId} />
    </NodeNotesAuthShell>
  );
}
