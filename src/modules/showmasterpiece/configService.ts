import { db } from '@/db';
import {
  ShowmasterConfigService,
  createShowmasterConfigService,
} from '@/modules/showmasterpiece/server';

export { ShowmasterConfigService, createShowmasterConfigService };

export const showmasterConfigService = createShowmasterConfigService(db);
