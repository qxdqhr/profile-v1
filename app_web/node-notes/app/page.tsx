import NodeNotesAuthShell from '../lib/NodeNotesAuthShell';
import { NodeNotesGalleryPage } from 'sa2kit/business/nodeNotes/ui/web';

export default function NodeNotesHomePage() {
  return (
    <NodeNotesAuthShell>
      <NodeNotesGalleryPage />
    </NodeNotesAuthShell>
  );
}
