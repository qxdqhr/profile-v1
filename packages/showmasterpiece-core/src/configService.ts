import { db } from '@profile/db';
import {
  ShowmasterConfigService,
  createShowmasterConfigService,
} from './server';

export { ShowmasterConfigService, createShowmasterConfigService };

export const showmasterConfigService = createShowmasterConfigService(db);
