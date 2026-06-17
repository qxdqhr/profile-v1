import { ResourcesPage } from '@profile/teach-hub-core/pages';

type Props = { params: Promise<{ workspaceId: string }> };

export default async function ResourcesRoute({ params }: Props) {
  const { workspaceId } = await params;
  return <ResourcesPage workspaceId={workspaceId} />;
}
