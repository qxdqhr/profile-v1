import { MissionPage } from '@profile/teach-hub-core/pages';

type Props = { params: Promise<{ workspaceId: string }> };

export default async function MissionRoute({ params }: Props) {
  const { workspaceId } = await params;
  return <MissionPage workspaceId={workspaceId} />;
}
