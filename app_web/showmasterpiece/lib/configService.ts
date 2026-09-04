import { db } from '@profile/db';
import {
  createShowmasterConfigService,
  type ShowmasterConfigService,
} from 'sa2kit/business/showmasterpiece/server';

export { createShowmasterConfigService };
export type { ShowmasterConfigService };

export const showmasterConfigService = createShowmasterConfigService(db);
