import { db } from '@profile/db';
import {
  initializeShowmasterpieceDb,
  masterpiecesConfigDbService,
  categoriesDbService,
  tagsDbService,
  collectionsDbService,
  artworksDbService,
  MasterpiecesConfigDbService,
  CategoriesDbService,
  TagsDbService,
} from './server';
import { getShowmasterpieceFileUrlResolver } from './fileUrl';

initializeShowmasterpieceDb(db, (fileId) =>
  getShowmasterpieceFileUrlResolver()(fileId),
);

export {
  MasterpiecesConfigDbService,
  CategoriesDbService,
  TagsDbService,
  masterpiecesConfigDbService,
  categoriesDbService,
  tagsDbService,
  collectionsDbService,
  artworksDbService,
};
