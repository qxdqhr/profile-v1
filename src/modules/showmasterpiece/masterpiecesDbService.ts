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

let showmasterpieceFileServicePromise: Promise<{
  getFileUrl: (fileId: string) => Promise<string>;
}> | null = null;

async function resolveShowmasterpieceFileUrl(fileId: string): Promise<string | null> {
  if (!showmasterpieceFileServicePromise) {
    showmasterpieceFileServicePromise = (async () => {
      const { getShowMasterpieceFileConfig } = await import('sa2kit/showmasterpiece/server');
      const configManager = await getShowMasterpieceFileConfig();
      const { UniversalFileService } = await import('sa2kit/universalFile/server');
      const fileService = new UniversalFileService(configManager.getConfig());
      await fileService.initialize();
      return fileService;
    })();
  }

  try {
    const fileService = await showmasterpieceFileServicePromise;
    return await fileService.getFileUrl(fileId);
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
