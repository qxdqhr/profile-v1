'use client';

import Link from 'next/link';
import { Card, Button } from 'animal-island-ui';
import type { TeachWorkspaceSummary } from '../types';
import { lessonPath, workspacePath } from '../utils/routes';
import { ProgressBar } from './ProgressBar';

type WorkspaceCardProps = {
  workspace: TeachWorkspaceSummary;
};

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const completed = workspace.completedLessonCount ?? 0;
  const total = workspace.lessonCount || 0;
  const continueHref = workspace.lastLessonSlug
    ? lessonPath(workspace.id, workspace.lastLessonSlug)
    : workspacePath(workspace.id);

  return (
    <Card color="default" className="h-full">
      <div className="flex h-full flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#3d3428]">{workspace.title}</h3>
          {workspace.topic ? (
            <p className="th-card-meta">主题：{workspace.topic}</p>
          ) : null}
          {workspace.missionSummary ? (
            <p className="th-card-meta line-clamp-2">{workspace.missionSummary}</p>
          ) : null}
        </div>

        {total > 0 ? <ProgressBar completed={completed} total={total} /> : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Link href={workspacePath(workspace.id)}>
            <Button type="primary" size="small">
              进入工作区
            </Button>
          </Link>
          {total > 0 ? (
            <Link href={continueHref}>
              <Button type="default" size="small">
                继续学习
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
