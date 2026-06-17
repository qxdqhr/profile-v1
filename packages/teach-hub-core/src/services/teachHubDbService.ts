import { randomUUID } from 'crypto';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@profile/db';
import {
  teachGenerateJobs,
  teachLessonProgress,
  teachWorkspaces,
} from '../db/schema';
import type {
  CreateWorkspaceInput,
  LessonProgressStatus,
  TeachGenerateJob,
  TeachLessonProgress,
  TeachWorkspace,
  TeachWorkspaceSummary,
  UpdateProgressInput,
  WorkspaceStatus,
} from '../types';
import { slugifyTitle } from '../utils/teachWorkspacePaths';
import {
  buildWorkspaceMeta,
  composeMissionMarkdown,
  DEFAULT_NOTES_MD,
  DEFAULT_RESOURCES_MD,
} from '../utils/workspaceTemplates';
import { initEmptyWorkspaceFiles, listWorkspaceLessons } from './teachHubFileStore';
import { formatTeachHubStorageError } from '../utils/storageFallback';

function mapWorkspace(row: typeof teachWorkspaces.$inferSelect): TeachWorkspace {
  return {
    id: row.id,
    userId: row.userId,
    slug: row.slug,
    title: row.title,
    topic: row.topic,
    status: row.status as WorkspaceStatus,
    missionSummary: row.missionSummary,
    lessonCount: row.lessonCount,
    lastLessonSlug: row.lastLessonSlug,
    lastOpenedAt: row.lastOpenedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapProgress(row: typeof teachLessonProgress.$inferSelect): TeachLessonProgress {
  return {
    id: row.id,
    userId: row.userId,
    workspaceId: row.workspaceId,
    lessonSlug: row.lessonSlug,
    lessonOrder: row.lessonOrder,
    status: row.status as LessonProgressStatus,
    quizScore: row.quizScore,
    quizTotal: row.quizTotal,
    startedAt: row.startedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    nextReviewAt: row.nextReviewAt?.toISOString() ?? null,
  };
}

function mapGenerateJob(row: typeof teachGenerateJobs.$inferSelect): TeachGenerateJob {
  return {
    id: row.id,
    userId: row.userId,
    workspaceId: row.workspaceId,
    trigger: row.trigger as TeachGenerateJob['trigger'],
    status: row.status as TeachGenerateJob['status'],
    inputSnapshot: (row.inputSnapshot as Record<string, unknown> | null) ?? null,
    outputFiles: Array.isArray(row.outputFiles) ? (row.outputFiles as string[]) : null,
    errorMessage: row.errorMessage,
    createdAt: row.createdAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString() ?? null,
  };
}

async function ensureUniqueSlug(userId: string, baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    const existing = await db
      .select({ id: teachWorkspaces.id })
      .from(teachWorkspaces)
      .where(and(eq(teachWorkspaces.userId, userId), eq(teachWorkspaces.slug, slug)))
      .limit(1);
    if (!existing.length) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

export async function listWorkspacesByUser(userId: string): Promise<TeachWorkspaceSummary[]> {
  const rows = await db
    .select()
    .from(teachWorkspaces)
    .where(eq(teachWorkspaces.userId, userId))
    .orderBy(desc(teachWorkspaces.lastOpenedAt), desc(teachWorkspaces.updatedAt));

  const summaries: TeachWorkspaceSummary[] = [];
  for (const row of rows) {
    const completed = await db
      .select({ id: teachLessonProgress.id })
      .from(teachLessonProgress)
      .where(
        and(
          eq(teachLessonProgress.workspaceId, row.id),
          eq(teachLessonProgress.status, 'completed'),
        ),
      );
    summaries.push({
      ...mapWorkspace(row),
      completedLessonCount: completed.length,
    });
  }
  return summaries;
}

export async function getWorkspaceForUser(
  userId: string,
  workspaceId: string,
): Promise<TeachWorkspace | null> {
  const rows = await db
    .select()
    .from(teachWorkspaces)
    .where(and(eq(teachWorkspaces.id, workspaceId), eq(teachWorkspaces.userId, userId)))
    .limit(1);
  const row = rows[0];
  return row ? mapWorkspace(row) : null;
}

export async function assertWorkspaceForUser(
  userId: string,
  workspaceId: string,
): Promise<TeachWorkspace> {
  const workspace = await getWorkspaceForUser(userId, workspaceId);
  if (!workspace) {
    throw new Error('工作区不存在或无权访问');
  }
  return workspace;
}

export async function createWorkspace(
  userId: string,
  input: CreateWorkspaceInput,
): Promise<TeachWorkspace> {
  const workspaceId = randomUUID();
  const baseSlug = slugifyTitle(input.title);
  const slug = await ensureUniqueSlug(userId, baseSlug);
  const missionMarkdown = composeMissionMarkdown({
    why: input.missionDraft?.why ?? '',
    successLooksLike: input.missionDraft?.successLooksLike,
    constraints: input.missionDraft?.constraints,
    outOfScope: input.missionDraft?.outOfScope,
  });
  const missionSummary =
    input.missionDraft?.why?.trim() ||
    '（请填写你学习这个主题的原因）';

  const now = new Date();
  await db.insert(teachWorkspaces).values({
    id: workspaceId,
    userId,
    slug,
    title: input.title.trim(),
    topic: input.topic?.trim() || null,
    status: 'active',
    missionSummary,
    lessonCount: 0,
    lastLessonSlug: null,
    lastOpenedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  try {
    await initEmptyWorkspaceFiles({
      userId,
      workspaceId,
      title: input.title.trim(),
      topic: input.topic ?? null,
      missionMarkdown,
      resourcesMarkdown: DEFAULT_RESOURCES_MD,
      notesMarkdown: DEFAULT_NOTES_MD,
      metaJson: buildWorkspaceMeta({
        title: input.title.trim(),
        topic: input.topic ?? null,
      }),
    });
  } catch (error) {
    await db.delete(teachWorkspaces).where(eq(teachWorkspaces.id, workspaceId));
    throw new Error(formatTeachHubStorageError(error));
  }

  const created = await getWorkspaceForUser(userId, workspaceId);
  if (!created) {
    throw new Error('创建工作区失败');
  }
  return created;
}

export async function touchWorkspaceOpened(userId: string, workspaceId: string): Promise<void> {
  await db
    .update(teachWorkspaces)
    .set({ lastOpenedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(teachWorkspaces.id, workspaceId), eq(teachWorkspaces.userId, userId)));
}

export async function updateWorkspaceMeta(
  userId: string,
  workspaceId: string,
  patch: {
    title?: string;
    status?: WorkspaceStatus;
    missionSummary?: string | null;
    lessonCount?: number;
    lastLessonSlug?: string | null;
  },
): Promise<TeachWorkspace> {
  await db
    .update(teachWorkspaces)
    .set({
      ...patch,
      updatedAt: new Date(),
    })
    .where(and(eq(teachWorkspaces.id, workspaceId), eq(teachWorkspaces.userId, userId)));

  const updated = await getWorkspaceForUser(userId, workspaceId);
  if (!updated) throw new Error('更新工作区失败');
  return updated;
}

export async function syncWorkspaceLessonCache(userId: string, workspaceId: string): Promise<void> {
  const lessons = await listWorkspaceLessons(userId, workspaceId);
  const last = lessons[lessons.length - 1];
  await updateWorkspaceMeta(userId, workspaceId, {
    lessonCount: lessons.length,
    lastLessonSlug: last?.slug ?? null,
  });
}

export async function listLessonProgress(
  userId: string,
  workspaceId: string,
): Promise<TeachLessonProgress[]> {
  await assertWorkspaceForUser(userId, workspaceId);
  const rows = await db
    .select()
    .from(teachLessonProgress)
    .where(eq(teachLessonProgress.workspaceId, workspaceId))
    .orderBy(teachLessonProgress.lessonOrder);
  return rows.map(mapProgress);
}

export async function ensureLessonProgressRows(
  userId: string,
  workspaceId: string,
): Promise<TeachLessonProgress[]> {
  await assertWorkspaceForUser(userId, workspaceId);
  const lessons = await listWorkspaceLessons(userId, workspaceId);
  const existing = await listLessonProgress(userId, workspaceId);
  const existingSlugs = new Set(existing.map((p) => p.lessonSlug));

  for (const lesson of lessons) {
    if (existingSlugs.has(lesson.slug)) continue;
    await db.insert(teachLessonProgress).values({
      id: randomUUID(),
      userId,
      workspaceId,
      lessonSlug: lesson.slug,
      lessonOrder: lesson.order,
      status: 'available',
      quizScore: null,
      quizTotal: null,
      startedAt: null,
      completedAt: null,
      nextReviewAt: null,
    });
  }

  return listLessonProgress(userId, workspaceId);
}

export async function upsertLessonProgress(
  userId: string,
  workspaceId: string,
  input: UpdateProgressInput,
): Promise<TeachLessonProgress> {
  await assertWorkspaceForUser(userId, workspaceId);
  await ensureLessonProgressRows(userId, workspaceId);

  const rows = await db
    .select()
    .from(teachLessonProgress)
    .where(
      and(
        eq(teachLessonProgress.workspaceId, workspaceId),
        eq(teachLessonProgress.lessonSlug, input.lessonSlug),
      ),
    )
    .limit(1);

  const now = new Date();
  const row = rows[0];
  if (!row) {
    throw new Error(`课时不存在: ${input.lessonSlug}`);
  }

  const patch: Partial<typeof teachLessonProgress.$inferInsert> = {
    status: input.status,
    quizScore: input.quizScore ?? row.quizScore,
    quizTotal: input.quizTotal ?? row.quizTotal,
  };
  if (input.status === 'in_progress' && !row.startedAt) {
    patch.startedAt = now;
  }
  if (input.status === 'completed') {
    patch.completedAt = now;
  }

  await db
    .update(teachLessonProgress)
    .set(patch)
    .where(eq(teachLessonProgress.id, row.id));

  const updated = await db
    .select()
    .from(teachLessonProgress)
    .where(eq(teachLessonProgress.id, row.id))
    .limit(1);
  return mapProgress(updated[0]);
}

export async function archiveWorkspace(userId: string, workspaceId: string): Promise<TeachWorkspace> {
  return updateWorkspaceMeta(userId, workspaceId, { status: 'archived' });
}

export async function listGenerateJobs(
  userId: string,
  workspaceId: string,
): Promise<TeachGenerateJob[]> {
  await assertWorkspaceForUser(userId, workspaceId);
  const rows = await db
    .select()
    .from(teachGenerateJobs)
    .where(eq(teachGenerateJobs.workspaceId, workspaceId))
    .orderBy(desc(teachGenerateJobs.createdAt))
    .limit(50);
  return rows.map(mapGenerateJob);
}
