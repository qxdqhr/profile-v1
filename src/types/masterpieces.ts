export interface ArtworkPage {
  id: number;
  title: string;
  image: string;
  artist: string;
  description?: string;
  year?: string;
  medium?: string;
}

export interface ArtCollection {
  id: number;
  title: string;
  artist: string;
  coverImage: string;
  description: string;
  pages: ArtworkPage[];
  category?: string;
  tags?: string[];
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterpiecesState {
  selectedCollection: ArtCollection | null;
  currentPage: number;
}

export interface MasterpiecesActions {
  selectCollection: (collection: ArtCollection) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (pageIndex: number) => void;
  backToGallery: () => void;
}

// 配置管理相关类型
export interface MasterpiecesConfig {
  id?: number;
  siteName: string;
  siteDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  maxCollectionsPerPage: number;
  enableSearch: boolean;
  enableCategories: boolean;
  defaultCategory: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'zh' | 'en';
  createdAt?: string;
  updatedAt?: string;
}

export interface ConfigFormData {
  siteName: string;
  siteDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  maxCollectionsPerPage: number;
  enableSearch: boolean;
  enableCategories: boolean;
  defaultCategory: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'zh' | 'en';
}

export interface CollectionFormData {
  title: string;
  artist: string;
  coverImage: string;
  description: string;
  category: string;
  tags: string[];
  isPublished: boolean;
}

export interface ArtworkFormData {
  title: string;
  artist: string;
  image: string;
  description: string;
  year: string;
  medium: string;
} 