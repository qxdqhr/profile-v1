import { requireAuthUser, fail } from '../../../_helpers';
import { nodeNotesDbService } from '../../../../db/nodeNotesDbService';
import { buildDocumentZip } from '../../../../utils/exportDocumentZip';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAuthUser(request);
  if (response) return response;

  const { id } = await context.params;
  const graph = await nodeNotesDbService.getDocumentGraph(id, String(user!.id));
  if (!graph) return fail('文档不存在', 404);

  const zipBuffer = buildDocumentZip(graph);
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  const filename = `${graph.document.slug}-${stamp}.zip`;

  return new Response(new Uint8Array(zipBuffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
