import { db } from '@/db';
import { getApiSessionUser, isAdminRole } from '@/lib/auth/session';
import { createProfileFileService, getProfileOssFileBootstrap } from '@/lib/ossFile/env';
import { FileDbService } from 'sa2kit/common/file/server';
import { createSkillManagerFileStore } from 'sa2kit/business/skillManager/server';
import type { SkillManagerRouteConfig } from 'sa2kit/business/skillManager/routes';

export function createSkillManagerHostRouteConfig(): SkillManagerRouteConfig {
  const fileStore = createSkillManagerFileStore({
    createFileDbService: () => new FileDbService(db),
    createFileService: createProfileFileService,
    getFileUrl: (fileId) => getProfileOssFileBootstrap().getFileUrl(fileId),
  });

  return {
    db,
    fileStore,
    getSessionUser: getApiSessionUser,
    isAdminRole,
  };
}
