/**
 * 兼容层：注入 @profile/db + OSS fileStore。
 * 新代码请用 `createTeachHubDbService` from `sa2kit/business/teachHub/server`。
 */
import { db } from '@profile/db';
import {
  createTeachHubDbService,
  type TeachHubDbService,
} from 'sa2kit/business/teachHub/server';
import {
  initEmptyWorkspaceFiles,
  listWorkspaceLessons,
  repairWorkspaceSeedFilesIfMissing,
} from './teachHubFileStore';
import { formatTeachHubStorageError } from '../utils/storageFallback';

export {
  createTeachHubDbService,
  TeachHubDbService,
  type TeachHubFileStoreAdapter,
  type DrizzleLikeDb,
} from 'sa2kit/business/teachHub/server';

const service: TeachHubDbService = createTeachHubDbService(db, {
  fileStore: {
    initEmptyWorkspaceFiles,
    listWorkspaceLessons,
    repairWorkspaceSeedFilesIfMissing,
  },
  formatStorageError: formatTeachHubStorageError,
});

export const listWorkspacesByUser = service.listWorkspacesByUser.bind(service);
export const getWorkspaceForUser = service.getWorkspaceForUser.bind(service);
export const assertWorkspaceForUser = service.assertWorkspaceForUser.bind(service);
export const createWorkspace = service.createWorkspace.bind(service);
export const touchWorkspaceOpened = service.touchWorkspaceOpened.bind(service);
export const updateWorkspaceMeta = service.updateWorkspaceMeta.bind(service);
export const syncWorkspaceLessonCache = service.syncWorkspaceLessonCache.bind(service);
export const listLessonProgress = service.listLessonProgress.bind(service);
export const ensureLessonProgressRows = service.ensureLessonProgressRows.bind(service);
export const upsertLessonProgress = service.upsertLessonProgress.bind(service);
export const archiveWorkspace = service.archiveWorkspace.bind(service);
export const listGenerateJobs = service.listGenerateJobs.bind(service);
