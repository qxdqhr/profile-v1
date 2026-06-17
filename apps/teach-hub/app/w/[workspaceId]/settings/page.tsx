import { SettingsPage } from '@profile/teach-hub-core/pages';

type Props = { params: Promise<{ workspaceId: string }> };

export default async function SettingsRoute({ params }: Props) {
  const { workspaceId } = await params;
  return <SettingsPage workspaceId={workspaceId} />;
}
