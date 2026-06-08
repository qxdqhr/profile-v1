import { db } from '@/db';
import {
  PopupConfigService,
  createPopupConfigService,
} from '@/modules/showmasterpiece/server';

export { PopupConfigService, createPopupConfigService };

export const popupConfigService = createPopupConfigService(db);
