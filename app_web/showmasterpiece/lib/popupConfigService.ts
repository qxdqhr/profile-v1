import { db } from '@profile/db';
import {
  createPopupConfigService,
  type PopupConfigService,
} from 'sa2kit/business/showmasterpiece/server';

export { createPopupConfigService };
export type { PopupConfigService };

export const popupConfigService = createPopupConfigService(db);
