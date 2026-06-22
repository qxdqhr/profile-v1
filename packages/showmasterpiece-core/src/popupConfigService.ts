import { db } from '@profile/db';
import {
  PopupConfigService,
  createPopupConfigService,
} from './server';

export { PopupConfigService, createPopupConfigService };

export const popupConfigService = createPopupConfigService(db);
