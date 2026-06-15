'use client';

import Link from 'next/link';
import { Button } from 'animal-island-ui';
import { LessonViewer } from '../components/LessonViewer';
import { getWorkspaceFileUrl } from '../services/teachHubClient';
import { workspacePath } from '../utils/routes';

type ReferencePageProps = {
  workspaceId: string;
  slug: string;
};

export function ReferencePage({ workspaceId, slug }: ReferencePageProps) {
  const src = getWorkspaceFileUrl(workspaceId, `reference/${slug}.html`);
  return (
    <div className="th-lesson-shell">
      <div className="th-lesson-toolbar">
        <Link href={workspacePath(workspaceId)}>
          <Button type="text" size="small">
            ← 工作区
          </Button>
        </Link>
        <span className="text-sm font-semibold">参考：{slug}</span>
      </div>
      <LessonViewer src={src} title={`参考 ${slug}`} />
    </div>
  );
}
