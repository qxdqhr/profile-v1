import {
  createCreateArtworkHandler,
  createListArtworksHandler,
  createPatchArtworksHandler,
} from 'sa2kit/business/showmasterpiece/routes';
import { createCatalogHostRouteConfig } from '../../../lib/catalogHostRouteConfig';

const config = createCatalogHostRouteConfig();

export const GET = createListArtworksHandler(config);
export const POST = createCreateArtworkHandler(config);
export const PATCH = createPatchArtworksHandler(config);
