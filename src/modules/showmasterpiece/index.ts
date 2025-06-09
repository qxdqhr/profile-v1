// ===== 客户端组件导出 =====
export { CollectionCard } from './components/CollectionCard';
export { ArtworkViewer } from './components/ArtworkViewer';
export { ThumbnailSidebar } from './components/ThumbnailSidebar';
export { CollectionOrderManager } from './components/CollectionOrderManager';
export { ArtworkOrderManager } from './components/ArtworkOrderManager';

// ===== 页面组件导出 =====
export { default as ShowMasterPiecesPage } from './pages/ShowMasterPiecesPage';
export { default as ShowMasterPiecesConfigPage } from './pages/config/page';

// ===== Hook导出 =====
export { useMasterpieces } from './hooks/useMasterpieces';
export { useMasterpiecesConfig } from './hooks/useMasterpiecesConfig';

// ===== 客户端服务导出 =====
export { MasterpiecesService } from './services/masterpiecesService';
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

// ===== 类型导出 =====
export type {
  MasterpiecesConfig,
  ArtCollection,
  ArtworkPage,
  CollectionFormData,
  ArtworkFormData,
  MasterpiecesState,
  MasterpiecesActions
} from './types';

// ===== 模块信息 =====
export const SHOWMASTERPIECE_MODULE_VERSION = '1.0.0';
export const SHOWMASTERPIECE_MODULE_NAME = '@profile-v1/showmasterpiece';

// ===== 服务端专用导出 =====
// 注意：这些只能在服务端使用，不要在客户端组件中导入
// 使用方式：import { masterpiecesConfigDbService } from '@/modules/showmasterpiece/server';
