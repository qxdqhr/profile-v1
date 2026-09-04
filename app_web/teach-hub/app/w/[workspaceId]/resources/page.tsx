import { ResourcesPage } from 'sa2kit/business/teachHub/ui/web';

type Props = { params: Promise<{ workspaceId: string }> };

export default async function ResourcesRoute({ params }: Props) {
  const { workspaceId } = await params;
  return <ResourcesPage workspaceId={workspaceId} />;
}
