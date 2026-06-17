import { randomUUID } from 'crypto';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@profile/db';
import { runAiTask } from 'sa2kit/common/aiApi/server';
import { teachGenerateJobs } from '../db/schema';
import { registerTeachHubAiTasks, TEACH_GENERATE_LESSON_TASK_ID } from '../ai/generateLessonTask';
import type { TeachGenerateLessonTaskInput } from '../ai/teachAgentPrompt';
import { outputFilePaths } from '../ai/validateGenerateOutput';
import type { GenerateTrigger, TeachGenerateJob } from '../types';
import { parseMissionMarkdown } from '../utils/missionParser';
import { getNextLessonOrder } from '../utils/lessonIndex';
import {
  assertWorkspaceForUser,
  ensureLessonProgressRows,
  listLessonProgress,
  syncWorkspaceLessonCache,
} from './teachHubDbService';
import {
  listWorkspaceFiles,
  listWorkspaceLessons,
  putWorkspaceFileText,
  readWorkspaceFileText,
} from './teachHubFileStore';

function mapJob(row: typeof teachGenerateJobs.$inferSelect): TeachGenerateJob {
  return {
    id: row.id,
    userId: row.userId,
    workspaceId: row.workspaceId,
    trigger: row.trigger as GenerateTrigger,
    status: row.status as TeachGenerateJob['status'],
    inputSnapshot: (row.inputSnapshot as Record<string, unknown> | null) ?? null,
    outputFiles: Array.isArray(row.outputFiles) ? (row.outputFiles as string[]) : null,
    errorMessage: row.errorMessage,
    createdAt: row.createdAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString() ?? null,
  };
}

export async function getRunningGenerateJob(
  workspaceId: string,
): Promise<TeachGenerateJob | null> {
  const rows = await db
    .select()
    .from(teachGenerateJobs)
    .where(
      and(
        eq(teachGenerateJobs.workspaceId, workspaceId),
        eq(teachGenerateJobs.status, 'running'),
      ),
    )
    .limit(1);
  return rows[0] ? mapJob(rows[0]) : null;
}

export async function getGenerateJobForUser(
  userId: string,
  workspaceId: string,
  jobId: string,
): Promise<TeachGenerateJob | null> {
  await assertWorkspaceForUser(userId, workspaceId);
  const rows = await db
    .select()
    .from(teachGenerateJobs)
    .where(
      and(
        eq(teachGenerateJobs.id, jobId),
        eq(teachGenerateJobs.workspaceId, workspaceId),
        eq(teachGenerateJobs.userId, userId),
      ),
    )
    .limit(1);
  return rows[0] ? mapJob(rows[0]) : null;
}

export async function listGenerateJobsForUser(
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
  return rows.map(mapJob);
}

async function loadLearningRecords(
  userId: string,
  workspaceId: string,
): Promise<string[]> {
  const files = await listWorkspaceFiles(userId, workspaceId);
  const paths = files
    .filter((f) => f.relativePath.startsWith('learning-records/') && f.relativePath.endsWith('.md'))
    .map((f) => f.relativePath)
    .sort();
  const contents: string[] = [];
  for (const path of paths) {
    try {
      contents.push(await readWorkspaceFileText(userId, workspaceId, path));
    } catch {
      // skip unreadable
    }
  }
  return contents;
}

export type GenerateLessonPrecondition =
  | { ok: true; trigger: 'first_lesson' | 'next_lesson' }
  | { ok: false; reason: string };

export async function checkGeneratePreconditions(
  userId: string,
  workspaceId: string,
  requested: 'first_lesson' | 'next_lesson',
): Promise<GenerateLessonPrecondition> {
  const workspace = await assertWorkspaceForUser(userId, workspaceId);
  const running = await getRunningGenerateJob(workspaceId);
  if (running) {
    return { ok: false, reason: '已有进行中的生成任务，请稍候' };
  }

  const lessons = await listWorkspaceLessons(userId, workspaceId);
  const progress = await listLessonProgress(userId, workspaceId);
  const missionMd = await readWorkspaceFileText(userId, workspaceId, 'MISSION.md').catch(
    () => '',
  );
  const mission = parseMissionMarkdown(missionMd);
  const hasWhy = Boolean(mission.why.trim() || workspace.missionSummary?.trim());

  if (requested === 'first_lesson') {
    if (lessons.length > 0) {
      return { ok: false, reason: '工作区已有课时，请使用「生成下一课」' };
    }
    if (!hasWhy) {
      return { ok: false, reason: '请先填写 Mission 中的学习动机（Why）' };
    }
    return { ok: true, trigger: 'first_lesson' };
  }

  if (lessons.length === 0) {
    return { ok: false, reason: '尚无课时，请使用「开始第一课」' };
  }

  const lastLesson = lessons[lessons.length - 1];
  const lastProgress = progress.find((p) => p.lessonSlug === lastLesson.slug);
  if (!lastProgress || lastProgress.status !== 'completed') {
    return {
      ok: false,
      reason: `请先完成课时：${lastLesson.slug}`,
    };
  }

  if (!hasWhy) {
    return { ok: false, reason: '请先完善 Mission' };
  }

  return { ok: true, trigger: 'next_lesson' };
}

export async function runGenerateLesson(input: {
  userId: string;
  workspaceId: string;
  trigger: 'first_lesson' | 'next_lesson';
}): Promise<TeachGenerateJob> {
  const pre = await checkGeneratePreconditions(input.userId, input.workspaceId, input.trigger);
  if (!pre.ok) {
    throw new Error(pre.reason);
  }

  const workspace = await assertWorkspaceForUser(input.userId, input.workspaceId);
  const lessons = await listWorkspaceLessons(input.userId, input.workspaceId);
  const nextOrder = getNextLessonOrder(lessons);
  const progress = await listLessonProgress(input.userId, input.workspaceId);

  const missionMarkdown = await readWorkspaceFileText(input.userId, input.workspaceId, 'MISSION.md');
  const notesMarkdown = await readWorkspaceFileText(input.userId, input.workspaceId, 'NOTES.md').catch(
    () => '',
  );
  const learningRecords = await loadLearningRecords(input.userId, input.workspaceId);

  const lastLesson = lessons[lessons.length - 1];
  const lastProgress = lastLesson
    ? progress.find((p) => p.lessonSlug === lastLesson.slug)
    : undefined;

  const taskInput: TeachGenerateLessonTaskInput = {
    workspaceId: input.workspaceId,
    trigger: input.trigger,
    nextOrder,
    workspaceTitle: workspace.title,
    missionMarkdown,
    notesMarkdown,
    learningRecords,
    existingLessonSlugs: lessons.map((l) => l.slug),
    lastQuizResult:
      lastLesson && lastProgress?.quizScore != null && lastProgress.quizTotal != null
        ? {
            lessonSlug: lastLesson.slug,
            score: lastProgress.quizScore,
            total: lastProgress.quizTotal,
          }
        : undefined,
  };

  const jobId = randomUUID();
  const now = new Date();
  await db.insert(teachGenerateJobs).values({
    id: jobId,
    userId: input.userId,
    workspaceId: input.workspaceId,
    trigger: input.trigger,
    status: 'running',
    inputSnapshot: {
      nextOrder,
      trigger: input.trigger,
      existingLessonCount: lessons.length,
    },
    outputFiles: null,
    errorMessage: null,
    createdAt: now,
    finishedAt: null,
  });

  try {
    registerTeachHubAiTasks();
    const result = await runAiTask(TEACH_GENERATE_LESSON_TASK_ID, taskInput, {
      userId: input.userId,
      requestId: jobId,
    });

    if (!result.success || !result.data) {
      const msg = result.error?.message || 'AI 生成失败';
      throw new Error(msg);
    }

    const { output } = result.data as { output: import('../types').GenerateLessonOutput; rawText: string };
    const paths: string[] = [];

    await putWorkspaceFileText({
      userId: input.userId,
      workspaceId: input.workspaceId,
      relativePath: `lessons/${output.lesson.slug}.html`,
      content: output.lesson.html,
      uploaderId: input.userId,
    });
    paths.push(`lessons/${output.lesson.slug}.html`);

    if (output.learningRecord) {
      const recOrder = String(output.learningRecord.order).padStart(4, '0');
      const recPath = `learning-records/${recOrder}-${output.learningRecord.slug}.md`;
      await putWorkspaceFileText({
        userId: input.userId,
        workspaceId: input.workspaceId,
        relativePath: recPath,
        content: output.learningRecord.markdown,
        uploaderId: input.userId,
      });
      paths.push(recPath);
    }

    if (output.reference) {
      const refPath = `reference/${output.reference.slug}.html`;
      await putWorkspaceFileText({
        userId: input.userId,
        workspaceId: input.workspaceId,
        relativePath: refPath,
        content: output.reference.html,
        uploaderId: input.userId,
      });
      paths.push(refPath);
    }

    const allPaths = outputFilePaths(output);
    await syncWorkspaceLessonCache(input.userId, input.workspaceId);
    await ensureLessonProgressRows(input.userId, input.workspaceId);

    const finishedAt = new Date();
    await db
      .update(teachGenerateJobs)
      .set({
        status: 'success',
        outputFiles: allPaths,
        finishedAt,
        errorMessage: null,
      })
      .where(eq(teachGenerateJobs.id, jobId));

    const rows = await db
      .select()
      .from(teachGenerateJobs)
      .where(eq(teachGenerateJobs.id, jobId))
      .limit(1);
    return mapJob(rows[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成失败';
    await db
      .update(teachGenerateJobs)
      .set({
        status: 'failed',
        errorMessage: message,
        finishedAt: new Date(),
      })
      .where(eq(teachGenerateJobs.id, jobId));

    const rows = await db
      .select()
      .from(teachGenerateJobs)
      .where(eq(teachGenerateJobs.id, jobId))
      .limit(1);
    return mapJob(rows[0]);
  }
}
