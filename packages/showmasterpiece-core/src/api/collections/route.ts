import {
  createCreateCollectionHandler,
  createListCollectionsHandler,
  createPatchCollectionsHandler,
} from 'sa2kit/business/showmasterpiece/routes';
import { createCatalogHostRouteConfig } from '../lib/catalogHostRouteConfig';

const config = createCatalogHostRouteConfig();

export const GET = createListCollectionsHandler(config);
export const POST = createCreateCollectionHandler(config);
export const PATCH = createPatchCollectionsHandler(config);
