import { WorkspacePage } from 'sa2kit/business/teachHub/ui/web';

type Props = { params: Promise<{ workspaceId: string }> };

export default async function WorkspaceRoute({ params }: Props) {
  const { workspaceId } = await params;
  return <WorkspacePage workspaceId={workspaceId} />;
}
