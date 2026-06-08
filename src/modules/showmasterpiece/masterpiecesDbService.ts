import { db } from '@/db/index';
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
} from '@/modules/showmasterpiece/server';
import { getShowmasterpieceFileUrlResolver } from '@/modules/showmasterpiece/fileUrl';

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
