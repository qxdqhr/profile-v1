// ===== 服务端专用导出 =====
// 这些只能在服务端使用（API路由、服务器组件等）

export { 
  masterpiecesConfigDbService,
  categoriesDbService,
  tagsDbService,
  collectionsDbService,
  artworksDbService
} from './db/masterpiecesDbService';

// 服务端专用函数
export { 
  getConfig,
  updateConfig,
  resetConfig,
  getAllCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  updateCollectionOrder,
  moveCollection,
  moveCollectionUp,
  moveCollectionDown,
  addArtworkToCollection,
  updateArtwork,
  deleteArtwork,
  getArtworksByCollection,
  updateArtworkOrder,
  moveArtwork,
  moveArtworkUp,
  moveArtworkDown,
  getCategories,
  getTags,
  getCollectionsOverview
} from './services/masterpiecesConfigService';

// 重新导出类型，方便服务端使用
export type {
  ArtworkPage,
  ArtCollection,
  MasterpiecesConfig,
  ConfigFormData,
  CollectionFormData,
  ArtworkFormData
} from './types';
