import {
  createGetSiteConfigHandler,
  createResetSiteConfigHandler,
  createUpdateSiteConfigHandler,
} from 'sa2kit/business/showmasterpiece/routes';
import { createSiteConfigHostRouteConfig } from '@lib/siteConfigHostRouteConfig';

const config = createSiteConfigHostRouteConfig();

export const GET = createGetSiteConfigHandler(config);
export const PUT = createUpdateSiteConfigHandler(config);
export const DELETE = createResetSiteConfigHandler(config);
