import { getApiSessionUser, isAdminRole } from '@profile/auth/session';
import type { CatalogRouteConfig } from 'sa2kit/business/showmasterpiece/routes';
import {
  artworksDbService,
  categoriesDbService,
  collectionsDbService,
  tagsDbService,
} from '../../masterpiecesDbService';
import { applyCollectionsCacheHeaders } from './collectionCache';

/** profile 宿主共用的 catalog（collections/categories/tags/artworks）route config */
export function createCatalogHostRouteConfig(): CatalogRouteConfig {
  return {
    collections: collectionsDbService,
    categories: categoriesDbService,
    tags: tagsDbService,
    artworks: artworksDbService,
    getSessionUser: getApiSessionUser,
    isAdminUser: (user) => isAdminRole(user?.role),
    applyCollectionsCacheHeaders,
  };
}
