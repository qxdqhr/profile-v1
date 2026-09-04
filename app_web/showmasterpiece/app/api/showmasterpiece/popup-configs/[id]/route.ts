import {
  createDeletePopupConfigHandler,
  createGetPopupConfigHandler,
  createUpdatePopupConfigHandler,
} from 'sa2kit/business/showmasterpiece/routes';
import { createPopupHostRouteConfig } from '@lib/popupHostRouteConfig';

const config = createPopupHostRouteConfig();

export const GET = createGetPopupConfigHandler(config);
export const PUT = createUpdatePopupConfigHandler(config);
export const DELETE = createDeletePopupConfigHandler(config);
