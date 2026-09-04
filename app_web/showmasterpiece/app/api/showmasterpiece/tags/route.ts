import { createListTagsHandler } from 'sa2kit/business/showmasterpiece/routes';
import { createCatalogHostRouteConfig } from '@lib/catalogHostRouteConfig';

const config = createCatalogHostRouteConfig();

export const GET = createListTagsHandler(config);
