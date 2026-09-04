import { createCheckPopupConfigHandler } from 'sa2kit/business/showmasterpiece/routes';
import { createPopupHostRouteConfig } from '@lib/popupHostRouteConfig';

const config = createPopupHostRouteConfig();

export const POST = createCheckPopupConfigHandler(config);
