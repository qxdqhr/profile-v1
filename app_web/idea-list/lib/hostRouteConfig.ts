import { db } from '@profile/db';
import { getApiSessionUser } from '@profile/auth/session';
import type { IdeaListRouteConfig } from 'sa2kit/business/ideaList/routes';

export function createIdeaListHostRouteConfig(): IdeaListRouteConfig {
  return { db, getSessionUser: getApiSessionUser };
}
