import { db } from '@profile/db';
import { getApiSessionUser } from '@profile/auth/session';
import type { FileTransferRouteConfig } from 'sa2kit/business/filetransfer/routes';

export function createFileTransferHostRouteConfig(): FileTransferRouteConfig {
  return { db, getSessionUser: getApiSessionUser };
}
