'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Loading, Title } from 'animal-island-ui';
import { ProgressBar } from '../components/ProgressBar';
import { GenerateLessonButton } from '../components/GenerateLessonButton';
import {
  mergeLessonsWithProgress,
  WorkspaceSidebar,
} from '../components/WorkspaceSidebar';
import { fetchWorkspaceDetail, fetchWorkspaceFiles } from '../services/teachHubClient';
import type { LessonIndex, TeachLessonProgress, TeachWorkspace } from '../types';
import { lessonPath, lessonTitleFromSlug } from '../utils/routes';

type WorkspacePageProps = {
  workspaceId: string;
};

export function WorkspacePage({ workspaceId }: WorkspacePageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workspace, setWorkspace] = useState<TeachWorkspace | null>(null);
  const [lessons, setLessons] = useState<LessonIndex[]>([]);
  const [progress, setProgress] = useState<TeachLessonProgress[]>([]);
  const [references, setReferences] = useState<string[]>([]);
  const [recordCount, setRecordCount] = useState(0);

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const [detail, files] = await Promise.all([
        fetchWorkspaceDetail(workspaceId),
        fetchWorkspaceFiles(workspaceId),
      ]);
      setWorkspace(detail.workspace);
      setLessons(detail.lessons);
      setProgress(detail.progress);
      const refs = files
        .filter((f) => f.relativePath.startsWith('reference/') && f.relativePath.endsWith('.html'))
        .map((f) => f.relativePath.replace(/^reference\//, '').replace(/\.html$/i, ''));
      setReferences(refs);
      setRecordCount(
        files.filter((f) => f.relativePath.startsWith('learning-records/')).length,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loading active />
      </div>
    );
  }

  if (error || !workspace) {
    return <p className="text-red-600">{error || '工作区不存在'}</p>;
  }

  const merged = mergeLessonsWithProgress(lessons, progress);
  const completed = progress.filter((p) => p.status === 'completed').length;
  const firstIncomplete = merged.find((m) => m.progress?.status !== 'completed');

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Title size="middle" color="app-teal">
            {workspace.title}
          </Title>
          {workspace.topic ? (
            <p className="th-card-meta">主题：{workspace.topic}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {firstIncomplete ? (
            <Link href={lessonPath(workspaceId, firstIncomplete.lesson.slug)}>
              <Button type="primary">继续学习</Button>
            </Link>
          ) : lessons.length > 0 ? (
            <Button type="default" disabled>
              全部完成
            </Button>
          ) : null}
          <GenerateLessonButton
            workspaceId={workspaceId}
            lessons={lessons}
            progress={progress}
            missionReady={Boolean(workspace.missionSummary?.trim())}
            onGenerated={() => void reload()}
          />
        </div>
      </div>

      {lessons.length > 0 ? (
        <div className="mb-6 max-w-md">
          <ProgressBar completed={completed} total={lessons.length} />
        </div>
      ) : null}

      <div className="th-workspace-layout">
        <WorkspaceSidebar
          workspace={workspace}
          workspaceId={workspaceId}
          references={references}
          recordCount={recordCount}
        />

        <section>
          <h2 className="mb-3 text-base font-semibold">课时</h2>
          {lessons.length === 0 ? (
            <div className="th-empty rounded-xl border border-dashed border-[#d4c9b5]">
              <p>尚无课时。</p>
              <p className="mt-2 text-sm">可在设置页导入 zip，或等待 Phase 2 自动生成第一课。</p>
            </div>
          ) : (
            <div className="th-lesson-list">
              {merged.map(({ lesson, progress: p }) => {
                const done = p?.status === 'completed';
                return (
                  <Link
                    key={lesson.slug}
                    href={lessonPath(workspaceId, lesson.slug)}
                    className={`th-lesson-item ${done ? 'is-done' : ''}`}
                  >
                    <div>
                      <div className="th-lesson-item__title">
                        {String(lesson.order).padStart(4, '0')} · {lessonTitleFromSlug(lesson.slug)}
                      </div>
                      <div className="th-lesson-item__meta">{lesson.slug}</div>
                    </div>
                    <span className="text-sm">{done ? '✓ 已完成' : '去学习 →'}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
