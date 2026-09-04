import { db } from '@profile/db';
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
} from 'sa2kit/business/showmasterpiece/server';
import { getShowmasterpieceFileUrlResolver } from './fileUrl';

export let masterpiecesConfigDbService: MasterpiecesConfigDbService;
export let categoriesDbService: CategoriesDbService;
export let tagsDbService: TagsDbService;
export let collectionsDbService: CollectionsDbService;
export let artworksDbService: ArtworksDbService;

let initialized = false;

export function initializeShowmasterpieceDb(): void {
  if (initialized) return;
  const resolver = (fileId: string) => getShowmasterpieceFileUrlResolver()(fileId);
  masterpiecesConfigDbService = createMasterpiecesConfigDbService(db);
  categoriesDbService = createCategoriesDbService(db);
  tagsDbService = createTagsDbService(db);
  collectionsDbService = createCollectionsDbService(db, resolver);
  artworksDbService = createArtworksDbService(db, collectionsDbService, resolver);
  initialized = true;
}

initializeShowmasterpieceDb();

export type {
  MasterpiecesConfigDbService,
  CategoriesDbService,
  TagsDbService,
};
