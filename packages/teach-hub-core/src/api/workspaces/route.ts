import { db } from '@profile/db';
import { getApiSessionUser } from '@profile/auth/session';
import {
  createListWorkspacesHandler,
  createCreateWorkspaceHandler,
} from 'sa2kit/business/teachHub/routes';
import {
  initEmptyWorkspaceFiles,
  listWorkspaceLessons,
  repairWorkspaceSeedFilesIfMissing,
} from '../../services/teachHubFileStore';
import { formatTeachHubStorageError } from '../../utils/storageFallback';

const config = {
  db,
  getSessionUser: getApiSessionUser,
  fileStore: {
    initEmptyWorkspaceFiles,
    listWorkspaceLessons,
    repairWorkspaceSeedFilesIfMissing,
  },
  formatStorageError: formatTeachHubStorageError,
};

export const GET = createListWorkspacesHandler(config);
export const POST = createCreateWorkspaceHandler(config);
