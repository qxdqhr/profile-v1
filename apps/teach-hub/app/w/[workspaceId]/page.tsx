import { WorkspacePage } from '@profile/teach-hub-core/pages';

type Props = { params: Promise<{ workspaceId: string }> };

export default async function WorkspaceRoute({ params }: Props) {
  const { workspaceId } = await params;
  return <WorkspacePage workspaceId={workspaceId} />;
}
