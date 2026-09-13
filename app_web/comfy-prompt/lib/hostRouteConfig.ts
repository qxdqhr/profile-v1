import { db } from '@profile/db';
import { getApiSessionUser } from '@profile/auth/session';
import type { ComfyPromptRouteConfig } from 'sa2kit/business/comfyPrompt/routes';

export function createComfyPromptHostRouteConfig(): ComfyPromptRouteConfig {
  return { db, getSessionUser: getApiSessionUser };
}
