import {
  createCreatePopupConfigHandler,
  createListPopupConfigsHandler,
} from 'sa2kit/business/showmasterpiece/routes';
import { createPopupHostRouteConfig } from '../lib/popupHostRouteConfig';

const config = createPopupHostRouteConfig();

export const GET = createListPopupConfigsHandler(config);
export const POST = createCreatePopupConfigHandler(config);
