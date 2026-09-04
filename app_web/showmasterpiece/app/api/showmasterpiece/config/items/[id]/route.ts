import {
  createDeleteConfigItemHandler,
  createGetConfigItemHandler,
  createUpdateConfigItemHandler,
} from 'sa2kit/business/showmasterpiece/routes';
import { createConfigItemsHostRouteConfig } from '@lib/configItemsHostRouteConfig';

const config = createConfigItemsHostRouteConfig();

export const GET = createGetConfigItemHandler(config);
export const PUT = createUpdateConfigItemHandler(config);
export const DELETE = createDeleteConfigItemHandler(config);
