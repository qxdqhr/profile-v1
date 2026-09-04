import {
  createCreateConfigItemHandler,
  createListConfigItemsHandler,
} from 'sa2kit/business/showmasterpiece/routes';
import { createConfigItemsHostRouteConfig } from '../../lib/configItemsHostRouteConfig';

const config = createConfigItemsHostRouteConfig();

export const GET = createListConfigItemsHandler(config);
export const POST = createCreateConfigItemHandler(config);
