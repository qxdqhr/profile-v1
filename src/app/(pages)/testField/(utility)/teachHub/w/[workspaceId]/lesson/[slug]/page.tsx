import { LessonPage } from '@/modules/teachHub/pages';

type Props = { params: Promise<{ workspaceId: string; slug: string }> };

export default async function LessonRoute({ params }: Props) {
  const { workspaceId, slug } = await params;
  return <LessonPage workspaceId={workspaceId} slug={slug} />;
}
