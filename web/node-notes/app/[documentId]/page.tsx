import { NodeNotesCanvasPage } from '@profile/node-notes-core';

export default async function NodeNotesDocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  return <NodeNotesCanvasPage documentId={documentId} />;
}
