declare module 'sa2kit/mmd' {
  export * from 'sa2kit';
}

declare module 'sa2kit/mmd/admin' {
  export * from 'sa2kit';
}

declare module 'sa2kit/server' {
  export * from 'sa2kit';
}

declare module 'sa2kit/mmd/server' {
  export * from 'sa2kit';
}

declare module 'sa2kit/mikutap' {
  export * from 'sa2kit';
}

declare module 'sa2kit/calendar' {
  export * from 'sa2kit';
}

declare module 'sa2kit/musicPlayer' {
  export * from 'sa2kit';
}

declare module 'sa2kit/testYourself' {
  export * from 'sa2kit';
}

declare module 'sa2kit/universalFile' {
  export * from 'sa2kit';
}

declare module 'sa2kit/mikuFusionGame' {
  export * from 'sa2kit';
}

declare module 'sa2kit/mikuFireworks3D' {
  export * from 'sa2kit';
}

declare module 'sa2kit/showmasterpiece/server' {
  export const comicUniverseArtworks: any;
  export const initializeShowmasterpieceDb: (
    db: any,
    resolver?: (fileId: string) => Promise<string | null | undefined>,
  ) => void;

  export const masterpiecesConfigDbService: any;
  export const categoriesDbService: any;
  export const tagsDbService: any;
  export const collectionsDbService: any;
  export const artworksDbService: any;

  export class MasterpiecesConfigDbService {}
  export class CategoriesDbService {}
  export class TagsDbService {}

  export class ShowmasterConfigService {
    [key: string]: any;
    getConfigItemByKey(key: string, environment?: string): Promise<any>;
    getConfigItems(params?: any): Promise<any>;
    getAllCategories(): Promise<any[]>;
    initializeDefaultCategories(): Promise<void>;
    createConfigItem(input: any): Promise<any>;
  }

  export const createShowmasterConfigService: (db: any) => ShowmasterConfigService;

  export class PopupConfigService {
    [key: string]: any;
  }
  export const createPopupConfigService: (db: any) => PopupConfigService;

  export type NewPopupConfig = any;

  export class BookingQueryService {
    getAdminBookings(input?: any): Promise<any>;
    getBookingsList(input?: any): Promise<any>;
    getBookingById(id: number): Promise<any | null>;
    getBookableCollections(input?: any): Promise<any[]>;
    exportBookingsCsv(): Promise<string>;
  }

  export const createBookingQueryService: (db: any) => BookingQueryService;

  export type BookingCommandErrorCode =
    | 'INVALID_BOOKING_ID'
    | 'BOOKING_NOT_FOUND'
    | 'INVALID_PAYLOAD'
    | 'INVALID_PHONE'
    | 'INVALID_QQ'
    | 'INVALID_QUANTITY'
    | 'COLLECTION_NOT_FOUND'
    | 'INVALID_STATUS';

  export class BookingCommandError extends Error {
    code: BookingCommandErrorCode;
    constructor(code: BookingCommandErrorCode, message: string);
  }

  export class BookingCommandService {
    createBooking(input: any): Promise<any>;
    batchCreateBookings(input: any): Promise<any>;
    updateBooking(id: number, input: any): Promise<any>;
    updateBookingStatus(id: number, status: string, adminNotes?: string): Promise<any>;
    deleteBooking(id: number): Promise<void>;
  }

  export const createBookingCommandService: (db: any) => BookingCommandService;
}

declare module 'sa2kit/showmasterpiece' {
  export const ShowMasterPiecesPage: any;
  export const ShowMasterPiecesConfigPage: any;
  export const ShowMasterPiecesHistoryPage: any;

  export const CartProvider: any;
  export const GenericOrderManager: any;

  export const MasterpiecesService: any;
  export const getMasterpieces: any;
  export const getConfig: any;
  export const updateConfig: any;
  export const resetConfig: any;
  export const getAllCollections: any;
  export const createCollection: any;
  export const updateCollection: any;
  export const deleteCollection: any;
  export const updateCollectionOrder: any;
  export const moveCollection: any;
  export const moveCollectionUp: any;
  export const moveCollectionDown: any;
  export const addArtworkToCollection: any;
  export const updateArtwork: any;
  export const deleteArtwork: any;
  export const getArtworksByCollection: any;
  export const updateArtworkOrder: any;
  export const moveArtwork: any;
  export const moveArtworkUp: any;
  export const moveArtworkDown: any;
  export const getCategories: any;
  export const getTags: any;
  export const getCollectionsOverview: any;

  export const CartService: any;
  export const getCart: any;
  export const addToCart: any;
  export const updateCartItem: any;
  export const removeFromCart: any;
  export const clearCart: any;
  export const batchBooking: any;

  export const BookingService: any;
  export const createBooking: any;
  export const getBookings: any;
  export const getBooking: any;
  export const updateBooking: any;
  export const deleteBooking: any;
  export const getBookableCollections: any;

  export const BookingAdminService: any;
  export const getAllBookings: any;
  export const getBookingStats: any;
  export const updateBookingStatus: any;
  export const exportBookings: any;

  export type BookingStatus = any;
  export type CreateBookingRequest = any;
  export type UpdateBookingRequest = any;
  export type BookingListParams = any;
  export type ArtworkPage = any;
  export type ArtCollection = any;
  export type MasterpiecesConfig = any;
  export type ConfigFormData = any;
  export type CollectionFormData = any;
  export type ArtworkFormData = any;

  export const getShowMasterpieceFileConfig: any;
  export const uploadArtworkImage: any;
  export const getArtworkImageUrl: any;
  export const shouldUseUniversalFileService: any;
  export const getStorageModeDisplayName: any;
  export const clearConfigCache: any;
  export const refreshFileServiceConfig: any;

  export const SHOWMASTERPIECE_MODULE_VERSION: string;
  export const SHOWMASTERPIECE_MODULE_NAME: string;
}


declare module 'sa2kit/showmasterpiece/scripts' {
  export const migrateConfigToShowmasterpiece: (...args: any[]) => Promise<any>;
}

declare module 'sa2kit/showmasterpiece/migration' {
  export const ArtworkMigrator: any;
  export const parseMigrationArguments: (...args: any[]) => any;
  export const getMigrationHelpText: () => string;
  export const validateMigrationPrerequisites: (...args: any[]) => void;
  export const runArtworkMigration: (...args: any[]) => Promise<any>;
  export type MigrationConfig = any;
  export type MigrationStats = any;
}
