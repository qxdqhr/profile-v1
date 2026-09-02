import { redirect } from 'next/navigation';
import { getNodeNotesAppUrl } from '@/lib/node-notes-app-url';

/** 节点笔记已迁至 @profile/node-notes 子应用 */
export default async function NodeNotesDocumentRedirectPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  redirect(getNodeNotesAppUrl(`/${documentId}`));
}
