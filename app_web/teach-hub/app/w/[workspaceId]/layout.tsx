import { WorkspaceShell } from '@profile/teach-hub-core/layout/WorkspaceShell';

type Props = {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceRouteLayout({ children, params }: Props) {
  const { workspaceId } = await params;
  return <WorkspaceShell workspaceId={workspaceId}>{children}</WorkspaceShell>;
}
