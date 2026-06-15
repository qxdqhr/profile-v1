'use client';

import Link from 'next/link';
import type { LessonIndex, TeachLessonProgress, TeachWorkspace } from '../types';
import { referencePath, workspacePath } from '../utils/routes';

type WorkspaceSidebarProps = {
  workspace: TeachWorkspace;
  workspaceId: string;
  references: string[];
  recordCount: number;
};

export function WorkspaceSidebar({
  workspace,
  workspaceId,
  references,
  recordCount,
}: WorkspaceSidebarProps) {
  const base = workspacePath(workspaceId);
  return (
    <aside className="th-sidebar-panel">
      <h3>Mission</h3>
      <p className="mb-3">{workspace.missionSummary || '尚未填写学习动机'}</p>
      <Link href={`${base}/mission`} className="text-sm text-[#2c5282] hover:underline">
        编辑 Mission →
      </Link>

      <hr className="my-4 border-[#eee8dc]" />

      <h3>导航</h3>
      <ul className="th-link-list">
        <li>
          <Link href={`${base}/resources`}>学习资源</Link>
        </li>
        <li>
          <Link href={`${base}/records`}>学习记录 ({recordCount})</Link>
        </li>
        <li>
          <Link href={`${base}/settings`}>工作区设置</Link>
        </li>
      </ul>

      {references.length > 0 ? (
        <>
          <hr className="my-4 border-[#eee8dc]" />
          <h3>速查参考</h3>
          <ul className="th-link-list">
            {references.map((slug) => (
              <li key={slug}>
                <Link href={referencePath(workspaceId, slug)}>{slug}</Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </aside>
  );
}

export function lessonProgressMap(progress: TeachLessonProgress[]) {
  return new Map(progress.map((p) => [p.lessonSlug, p]));
}

export function mergeLessonsWithProgress(
  lessons: LessonIndex[],
  progress: TeachLessonProgress[],
) {
  const map = lessonProgressMap(progress);
  return lessons.map((lesson) => ({
    lesson,
    progress: map.get(lesson.slug),
  }));
}
