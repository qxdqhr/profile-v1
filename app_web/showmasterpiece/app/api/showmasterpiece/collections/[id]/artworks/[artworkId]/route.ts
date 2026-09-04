import {
  createDeleteArtworkHandler,
  createUpdateArtworkHandler,
} from 'sa2kit/business/showmasterpiece/routes';
import { createCatalogHostRouteConfig } from '@lib/catalogHostRouteConfig';

const config = createCatalogHostRouteConfig();

export const PUT = createUpdateArtworkHandler(config);
export const DELETE = createDeleteArtworkHandler(config);
