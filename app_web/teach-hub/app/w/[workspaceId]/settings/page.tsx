import { SettingsPage } from 'sa2kit/business/teachHub/ui/web';

type Props = { params: Promise<{ workspaceId: string }> };

export default async function SettingsRoute({ params }: Props) {
  const { workspaceId } = await params;
  return <SettingsPage workspaceId={workspaceId} />;
}
