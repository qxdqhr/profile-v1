/**
 * teachHub 模块 — 服务端专用导出
 */

export {
  listWorkspacesByUser,
  getWorkspaceForUser,
  assertWorkspaceForUser,
  createWorkspace,
  touchWorkspaceOpened,
  updateWorkspaceMeta,
  syncWorkspaceLessonCache,
  listLessonProgress,
  ensureLessonProgressRows,
  upsertLessonProgress,
  archiveWorkspace,
  listGenerateJobs,
} from './services/teachHubDbService';

export {
  listWorkspaceFiles,
  getWorkspaceFileByPath,
  readWorkspaceFileText,
  putWorkspaceFileText,
  listWorkspaceLessons,
  importWorkspaceZip,
  buildWorkspaceZip,
  initEmptyWorkspaceFiles,
  repairWorkspaceSeedFilesIfMissing,
} from './services/teachHubFileStore';

export {
  checkGeneratePreconditions,
  getGenerateJobForUser,
  getRunningGenerateJob,
  listGenerateJobsForUser,
  runGenerateLesson,
} from './services/generateLessonService';

export { registerTeachHubAiTasks, TEACH_GENERATE_LESSON_TASK_ID } from './ai/generateLessonTask';

export { ensureTeachHubAiTasksRegistered } from './server/registerTasks';

export {
  teachWorkspaces,
  teachLessonProgress,
  teachGenerateJobs,
} from './db/schema';

export const TEACH_HUB_SERVER_MODULE_VERSION = '0.1.0';
