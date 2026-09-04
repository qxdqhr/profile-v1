import { db } from '@profile/db';
import { getApiSessionUser } from '@profile/auth/session';
import type { TeachHubRouteConfig } from 'sa2kit/business/teachHub/routes';
import {
  initEmptyWorkspaceFiles,
  listWorkspaceLessons,
  repairWorkspaceSeedFilesIfMissing,
  listWorkspaceFiles,
  readWorkspaceFileText,
  putWorkspaceFileText,
  importWorkspaceZip,
} from '../services/teachHubFileStore';
import { formatTeachHubStorageError } from '../utils/storageFallback';
import { teachHubPublicBase } from '../utils/routes';
import {
  checkGeneratePreconditions,
  getGenerateJobForUser,
  listGenerateJobsForUser,
  runGenerateLesson,
} from '../services/generateLessonService';

/** profile 宿主共用的 teachHub route config（session + OSS + generate） */
export function createTeachHubHostRouteConfig(): TeachHubRouteConfig {
  return {
    db,
    getSessionUser: getApiSessionUser,
    fileStore: {
      initEmptyWorkspaceFiles,
      listWorkspaceLessons,
      repairWorkspaceSeedFilesIfMissing,
      listWorkspaceFiles,
      readWorkspaceFileText,
      putWorkspaceFileText,
      importWorkspaceZip,
    },
    formatStorageError: formatTeachHubStorageError,
    getPublicBase: teachHubPublicBase,
    generate: {
      checkGeneratePreconditions,
      runGenerateLesson,
      listGenerateJobsForUser,
      getGenerateJobForUser,
    },
  };
}
