import { db } from '@profile/db';
import { getApiSessionUser } from '@profile/auth/session';
import type { FitnessPlanRouteConfig } from 'sa2kit/business/fitnessPlan/routes';
import { uploadDietImageToOss } from './dietUpload';

export function createFitnessPlanHostRouteConfig(): FitnessPlanRouteConfig {
  return {
    db,
    getSessionUser: getApiSessionUser,
    uploadDietImage: uploadDietImageToOss,
  };
}
