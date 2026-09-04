import {
  createDeleteCollectionHandler,
  createUpdateCollectionHandler,
} from 'sa2kit/business/showmasterpiece/routes';
import { createCatalogHostRouteConfig } from '@lib/catalogHostRouteConfig';

const config = createCatalogHostRouteConfig();

export const PUT = createUpdateCollectionHandler(config);
export const DELETE = createDeleteCollectionHandler(config);
