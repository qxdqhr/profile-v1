import { db } from '@profile/db';
import { getApiSessionUser } from '@profile/auth/session';
import type { NodeNotesRouteConfig } from 'sa2kit/business/nodeNotes/routes';

export function createNodeNotesHostRouteConfig(): NodeNotesRouteConfig {
  return { db, getSessionUser: getApiSessionUser };
}
