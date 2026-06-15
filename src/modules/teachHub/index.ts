/**
 * teachHub — 用户级 teach skill 学习工作区
 */

export { TeachHubLayout } from './layout/TeachHubLayout';
export {
  TeachHubHomePage,
  NewWorkspacePage,
  WorkspacePage,
  LessonPage,
  MissionPage,
  ReferencePage,
  RecordsPage,
  ResourcesPage,
  SettingsPage,
} from './pages';

export type * from './types';

export {
  listWorkspaceFiles,
  getWorkspaceFileByPath,
  readWorkspaceFileText,
  putWorkspaceFileText,
  listWorkspaceLessons,
  importWorkspaceZip,
  buildWorkspaceZip,
  initEmptyWorkspaceFiles,
} from './services/teachHubFileStore';

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
  fetchWorkspaces,
  createWorkspaceViaApi,
  fetchWorkspaceDetail,
  updateWorkspace,
  archiveWorkspaceViaApi,
  fetchWorkspaceFiles,
  getWorkspaceFileUrl,
  fetchWorkspaceFileText,
  putWorkspaceFileText,
  importWorkspaceZip as importWorkspaceZipViaApi,
  fetchLessonProgress,
  updateLessonProgress,
} from './services/teachHubClient';

export { useTeachHubBootstrap } from './hooks/useTeachHubBootstrap';
export { useTeachHubStore } from './store/teachHubStore';
