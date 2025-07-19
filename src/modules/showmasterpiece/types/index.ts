/**
 * ShowMasterpiece 模块 - TypeScript 类型定义
 * 
 * 这个文件定义了ShowMasterpiece模块中使用的所有TypeScript类型接口。
 * 这些类型确保了数据结构的一致性和类型安全。
 * 
 * 主要包含：
 * - 核心数据模型（作品、画集、配置）
 * - 表单数据类型
 * - 状态管理类型
 * - UI交互类型
 */

/**
 * 艺术作品页面数据结构
 * 
 * 表示画集中的单个作品页面，包含作品的基本信息和展示数据。
 * 每个画集由多个ArtworkPage组成。
 */
export interface ArtworkPage {
  /** 作品页面的唯一标识符 */
  id: number;
  
  /** 作品标题 */
  title: string;
  
  /** 作品图片文件名或路径（支持null值） */
  image: string | null;
  
  /** 通用文件服务的文件ID（可选，新架构） */
  fileId?: string;
  
  /** 完整的图片URL（可选，用于显示） */
  imageUrl?: string;
  
  /** 艺术家姓名 */
  artist: string;
  
  /** 作品描述（可选） */
  description?: string;
  
  /** 作品创作时间（可选） */
  createdTime?: string;
  
  /** 作品主题标签（可选） */
  theme?: string;
}

/**
 * 艺术画集数据结构
 * 
 * 表示一个完整的艺术画集，包含多个作品页面和相关元数据。
 * 这是系统中的核心数据模型之一。
 */
export interface ArtCollection {
  /** 画集的唯一标识符 */
  id: number;
  
  /** 画集标题 */
  title: string;
  
  /** 艺术家姓名 */
  artist: string;
  
  /** 画集封面图片路径 */
  coverImage: string;
  
  /** 通用文件服务的封面图片文件ID（新架构，可选） */
  coverImageFileId?: string;
  
  /** 画集描述 */
  description: string;
  
  /** 画集包含的所有作品页面 */
  pages: ArtworkPage[];
  
  /** 画集分类（可选） */
  category?: string;
  
  /** 画集标签列表（可选） */
  tags?: string[];
  
  /** 是否已发布（可选，默认true） */
  isPublished?: boolean;
  
  /** 创建时间（可选） */
  createdAt?: string;
  
  /** 更新时间（可选） */
  updatedAt?: string;
}

/**
 * 画集浏览状态
 * 
 * 用于管理用户在浏览画集时的当前状态，包括当前选中的画集和页面。
 * 主要用于useMasterpieces Hook的状态管理。
 */
export interface MasterpiecesState {
  /** 当前选中的画集（null表示在画集列表页面） */
  selectedCollection: ArtCollection | null;
  
  /** 当前查看的作品页面索引（从0开始） */
  currentPage: number;
}

/**
 * 画集浏览操作方法
 * 
 * 定义了用户在浏览画集时可以执行的所有操作方法。
 * 与MasterpiecesState配合使用，提供完整的状态管理方案。
 */
export interface MasterpiecesActions {
  /** 选择一个画集进行查看 */
  selectCollection: (collection: ArtCollection) => void;
  
  /** 切换到下一页作品 */
  nextPage: () => void;
  
  /** 切换到上一页作品 */
  prevPage: () => void;
  
  /** 跳转到指定页面的作品 */
  goToPage: (pageIndex: number) => void;
  
  /** 返回画集列表页面 */
  backToGallery: () => void;
}

/**
 * 系统配置数据结构
 * 
 * 存储ShowMasterpiece模块的全局配置信息，用于定制化展示效果和行为。
 * 这些配置会影响整个模块的显示和功能。
 */
export interface MasterpiecesConfig {
  /** 配置ID（可选，数据库主键） */
  id?: number;
  
  /** 网站名称 */
  siteName: string;
  
  /** 网站描述 */
  siteDescription: string;
  
  /** 首页主标题 */
  heroTitle: string;
  
  /** 首页副标题 */
  heroSubtitle: string;
  
  /** 每页显示的最大画集数量 */
  maxCollectionsPerPage: number;
  
  /** 是否启用搜索功能 */
  enableSearch: boolean;
  
  /** 是否启用分类功能 */
  enableCategories: boolean;
  
  /** 默认分类名称 */
  defaultCategory: string;
  
  /** 主题模式：浅色、深色或自动 */
  theme: 'light' | 'dark' | 'auto';
  
  /** 界面语言：中文或英文 */
  language: 'zh' | 'en';
  
  /** 配置创建时间（可选） */
  createdAt?: string;
  
  /** 配置更新时间（可选） */
  updatedAt?: string;
}

/**
 * 配置表单数据结构
 * 
 * 用于配置管理界面的表单数据绑定。
 * 与MasterpiecesConfig基本一致，但移除了数据库相关字段。
 */
export interface ConfigFormData {
  /** 网站名称 */
  siteName: string;
  
  /** 网站描述 */
  siteDescription: string;
  
  /** 首页主标题 */
  heroTitle: string;
  
  /** 首页副标题 */
  heroSubtitle: string;
  
  /** 每页显示的最大画集数量 */
  maxCollectionsPerPage: number;
  
  /** 是否启用搜索功能 */
  enableSearch: boolean;
  
  /** 是否启用分类功能 */
  enableCategories: boolean;
  
  /** 默认分类名称 */
  defaultCategory: string;
  
  /** 主题模式：浅色、深色或自动 */
  theme: 'light' | 'dark' | 'auto';
  
  /** 界面语言：中文或英文 */
  language: 'zh' | 'en';
}

/**
 * 画集表单数据结构
 * 
 * 用于画集创建和编辑表单的数据绑定。
 * 包含画集的基本信息，但不包含作品列表（作品单独管理）。
 * 支持新的通用文件服务架构和旧的Base64图片存储方式。
 */
export interface CollectionFormData {
  /** 画集标题 */
  title: string;
  
  /** 艺术家姓名 */
  artist: string;
  
  /** 画集封面图片路径（兼容旧架构） */
  coverImage: string;
  
  /** 通用文件服务的封面图片文件ID（新架构，可选） */
  coverImageFileId?: string;
  
  /** 画集描述 */
  description: string;
  
  /** 画集分类 */
  category: string;
  
  /** 画集标签列表 */
  tags: string[];
  
  /** 是否已发布 */
  isPublished: boolean;
}

/**
 * 作品表单数据结构
 * 
 * 用于作品添加和编辑表单的数据绑定。
 * 包含单个作品的所有基本信息。
 * 支持新的通用文件服务架构和旧的Base64图片存储方式。
 */
export interface ArtworkFormData {
  /** 作品标题 */
  title: string;
  
  /** 艺术家姓名 */
  artist: string;
  
  /** 作品图片路径（兼容旧架构，可选） */
  image?: string;
  
  /** 通用文件服务的文件ID（新架构，可选） */
  fileId?: string;
  
  /** 作品描述 */
  description: string;
  
  /** 作品创作时间 */
  createdTime: string;
  
  /** 作品主题标签 */
  theme: string;
} 