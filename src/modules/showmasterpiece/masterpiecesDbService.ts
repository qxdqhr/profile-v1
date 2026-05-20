import { db } from '@/db/index';
import '@/modules/showmasterpiece/sa2kit-init';
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
} from 'sa2kit/showmasterpiece/server';

const globalAny = globalThis as typeof globalThis & {
  __sa2kitShowmasterpieceResolveFileUrl?: (
    fileId: string,
  ) => Promise<string | null | undefined>;
};

async function resolveShowmasterpieceFileUrl(
  fileId: string,
): Promise<string | null> {
  const resolver = globalAny.__sa2kitShowmasterpieceResolveFileUrl;
  if (!resolver) {
    console.warn(
      '[showmasterpiece] 文件 URL 解析未初始化，请先 import sa2kit-init',
    );
    return null;
  }
  try {
    const url = await resolver(fileId);
    return url ?? null;
  } catch {
    return null;
  }
}

initializeShowmasterpieceDb(db, resolveShowmasterpieceFileUrl);

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
