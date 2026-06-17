import { RecordsPage } from '@profile/teach-hub-core/pages';

type Props = { params: Promise<{ workspaceId: string }> };

export default async function RecordsRoute({ params }: Props) {
  const { workspaceId } = await params;
  return <RecordsPage workspaceId={workspaceId} />;
}
