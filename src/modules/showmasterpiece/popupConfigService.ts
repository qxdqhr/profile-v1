import { db } from '@/db';
import {
  PopupConfigService,
  createPopupConfigService,
} from 'sa2kit/showmasterpiece/server';

export { PopupConfigService, createPopupConfigService };

export const popupConfigService = createPopupConfigService(db);
