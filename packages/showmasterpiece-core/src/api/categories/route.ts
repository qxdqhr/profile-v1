import {
  createCreateCategoryHandler,
  createListCategoriesHandler,
} from 'sa2kit/business/showmasterpiece/routes';
import { createCatalogHostRouteConfig } from '../lib/catalogHostRouteConfig';

const config = createCatalogHostRouteConfig();

export const GET = createListCategoriesHandler(config);
export const POST = createCreateCategoryHandler(config);
