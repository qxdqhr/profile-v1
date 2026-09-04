/** @deprecated 请改引 `sa2kit/business/showmasterpiece/server`；宿主经 initialize 注入 db/resolver */
import {
  createMasterpiecesConfigDbService,
  createCategoriesDbService,
  createTagsDbService,
  createCollectionsDbService,
  createArtworksDbService,
  type MasterpiecesConfigDbService,
  type CategoriesDbService,
  type TagsDbService,
  type CollectionsDbService,
  type ArtworksDbService,
  type FileUrlResolver,
} from 'sa2kit/business/showmasterpiece/server';

export type { FileUrlResolver };

export let masterpiecesConfigDbService: MasterpiecesConfigDbService;
export let categoriesDbService: CategoriesDbService;
export let tagsDbService: TagsDbService;
export let collectionsDbService: CollectionsDbService;
export let artworksDbService: ArtworksDbService;

let initialized = false;

export function initializeShowmasterpieceDb(
  database: any,
  resolver?: FileUrlResolver,
): void {
  masterpiecesConfigDbService = createMasterpiecesConfigDbService(database);
  categoriesDbService = createCategoriesDbService(database);
  tagsDbService = createTagsDbService(database);
  collectionsDbService = createCollectionsDbService(database, resolver);
  artworksDbService = createArtworksDbService(database, collectionsDbService, resolver);
  initialized = true;
}

export function assertShowmasterpieceDbInitialized(): void {
  if (!initialized) {
    throw new Error('Showmasterpiece DB services not initialized. Call initializeShowmasterpieceDb first.');
  }
}

export {
  MasterpiecesConfigDbService,
  CategoriesDbService,
  TagsDbService,
  CollectionsDbService,
  ArtworksDbService,
  createMasterpiecesConfigDbService,
  createCategoriesDbService,
  createTagsDbService,
  createCollectionsDbService,
  createArtworksDbService,
} from 'sa2kit/business/showmasterpiece/server';
