import { ReferencePage } from 'sa2kit/business/teachHub/ui/web';

type Props = { params: Promise<{ workspaceId: string; slug: string }> };

export default async function ReferenceRoute({ params }: Props) {
  const { workspaceId, slug } = await params;
  return <ReferencePage workspaceId={workspaceId} slug={slug} />;
}
