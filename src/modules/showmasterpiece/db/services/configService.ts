import { db } from '@/db';
import {
  ShowmasterConfigService,
  createShowmasterConfigService,
} from 'sa2kit/showmasterpiece/server';

export { ShowmasterConfigService, createShowmasterConfigService };

export const showmasterConfigService = createShowmasterConfigService(db);
