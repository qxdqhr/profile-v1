import { LessonPage } from 'sa2kit/business/teachHub/ui/web';

type Props = { params: Promise<{ workspaceId: string; slug: string }> };

export default async function LessonRoute({ params }: Props) {
  const { workspaceId, slug } = await params;
  return <LessonPage workspaceId={workspaceId} slug={slug} />;
}
