/**
 * ShowMasterpiece 模块类型定义
 * 
 * 包含画集、作品、配置等相关的TypeScript类型定义
 */

// ===== 画集分类枚举 =====

/**
 * 画集分类枚举
 * 
 * 定义画集的各种分类：
 * - COLLECTION: 画集 - 用于展示艺术作品
 * - ACRYLIC: 立牌 - 立牌制品
 * - BADGE: 吧唧 - 徽章类商品
 * - COLOR_PAPER: 色纸 - 彩色纸张制品
 * - POSTCARD: 明信片 - 明信片类商品
 * - LASER_TICKET: 镭射票 - 镭射票类商品
 * - CANVAS_BAG: 帆布包 - 帆布包类商品
 * - SUPPORT_STICK: 应援棒 - 应援棒类商品
 * - OTHER: 挂件/钥匙扣 - 挂件/钥匙扣类商品
 */
export enum CollectionCategory {
  /** 画集 - 用于展示艺术作品 */
  COLLECTION = 'collection',
  /** 立牌 - 立牌制品 */
  ACRYLIC = 'acrylic',
  /** 吧唧 - 徽章类商品 */
  BADGE = 'badge',
  /** 色纸 - 彩色纸张制品 */
  COLOR_PAPER = 'color_paper',
  /** 透卡 - 透明卡片制品 */
  TRANSPARENT_CARD = 'transparent_card',
  /** 明信片 - 明信片类商品 */
  POSTCARD = 'postcard',
  /** 镭射票 - 镭射票类商品 */
  LASER_TICKET = 'laser_ticket',
  /** 帆布包 - 帆布包类商品 */
  CANVAS_BAG = 'canvas_bag',
  /** 线圈笔记本 - 线圈装订笔记本 */
  SPIRAL_NOTEBOOK = 'spiral_notebook',
  /** 鼠标垫 - 鼠标垫类商品 */
  MOUSE_PAD = 'mouse_pad',
  /** 应援棒 - 应援棒类商品 */
  SUPPORT_STICK = 'support_stick',
  /** 挂件/钥匙扣 - 挂件/钥匙扣类商品 */
  KEYCHAIN = 'keychain',
  /** 其它 */
  OTHER = 'other'
}

/**
 * 画集分类类型
 * 使用枚举值作为类型
 */
export type CollectionCategoryType = `${CollectionCategory}`;

// ===== 基础类型定义 =====

/**
 * 艺术作品页面数据结构
 * 
 * 表示画集中的单个作品页面，包含图片、标题、描述等信息。
 * 每个画集包含多个这样的作品页面。
 */
export interface ArtworkPage {
  /** 作品的唯一标识符 */
  id: number;
  
  /** 作品标题 */
  title: string;
  
  /** 编号 */
  number: string;
  
  /** 作品图片（支持URL或base64编码） */
  image: string;
  
  /** 通用文件服务的图片文件ID（新架构，可选） */
  fileId?: string;
  
  /** 作品描述 */
  description: string;
  
  /** 创作时间（可选） */
  createdTime?: string;
  
  /** 作品主题（可选） */
  theme?: string;
  
  /** 作品年份（可选） */
  year?: string;
  
  /** 创作媒介（可选） */
  medium?: string;
  
  /** 作品尺寸（可选） */
  dimensions?: string;
  
  /** 在画集中的显示顺序 */
  pageOrder: number;
  
  /** 是否激活（可选，默认true） */
  isActive?: boolean;
  
  /** 创建时间（可选） */
  createdAt?: string;
  
  /** 更新时间（可选） */
  updatedAt?: string;
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
  
  /** 编号 */
  number: string;
  
  /** 画集封面图片路径 */
  coverImage: string;
  
  /** 通用文件服务的封面图片文件ID（新架构，可选） */
  coverImageFileId?: string;
  
  /** 画集描述 */
  description: string;
  
  /** 画集包含的所有作品页面 */
  pages: ArtworkPage[];
  
  /** 画集分类（使用枚举值） */
  category: CollectionCategoryType;
  
  /** 画集标签列表（可选） */
  tags?: string[];
  
  /** 是否已发布（可选，默认true） */
  isPublished?: boolean;
  
  /** 画集价格（单位：元，可选） */
  price?: number;
  
  /** 创建时间（可选） */
  createdAt?: string;
  
  /** 更新时间（可选） */
  updatedAt?: string;
}

// ===== 配置相关类型 =====

/**
 * 系统配置数据结构
 * 
 * 存储ShowMasterpiece模块的全局配置信息，
 * 包括网站设置、显示选项、功能开关等。
 */
export interface MasterpiecesConfig {
  /** 网站名称 */
  siteName: string;
  
  /** 网站描述 */
  siteDescription?: string;
  
  /** 首页主标题 */
  heroTitle: string;
  
  /** 首页副标题 */
  heroSubtitle?: string;
  
  /** 每页显示的最大画集数量 */
  maxCollectionsPerPage: number;
  
  /** 是否启用搜索功能 */
  enableSearch: boolean;
  
  /** 是否启用分类功能 */
  enableCategories: boolean;
  
  /** 默认分类 */
  defaultCategory: string;
  
  /** 主题模式：light(浅色)、dark(深色)、auto(自动) */
  theme: 'light' | 'dark' | 'auto';
  
  /** 界面语言：zh(中文)、en(英文) */
  language: 'zh' | 'en';
}

// ===== 表单数据类型 =====

/**
 * 画集表单数据结构
 * 
 * 用于创建和编辑画集时的表单数据
 */
export interface CollectionFormData {
  /** 画集标题 */
  title: string;
  
  /** 编号 */
  number: string;
  
  /** 封面图片 */
  coverImage: string;
  
  /** 通用文件服务的封面图片文件ID */
  coverImageFileId?: string;
  
  /** 画集描述 */
  description: string;
  
  /** 画集分类（使用枚举值） */
  category: CollectionCategoryType;
  
  /** 画集标签列表 */
tags: string[];
  
  /** 是否已发布 */
  isPublished: boolean;
  
  /** 画集价格（单位：元，可选） */
  price?: number;
}

/**
 * 作品表单数据结构
 * 
 * 用于创建和编辑作品时的表单数据
 */
export interface ArtworkFormData {
  /** 作品标题 */
  title: string;
  
  /** 编号 */
  number: string;
  
  /** 作品图片 */
  image?: string;
  
  /** 通用文件服务的图片文件ID */
  fileId?: string;
  
  /** 作品描述 */
  description: string;
  
  /** 创作时间 */
  createdTime: string;
  
  /** 作品主题 */
  theme: string;
}

/**
 * 配置表单数据结构
 * 
 * 用于编辑系统配置时的表单数据
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
  
  /** 默认分类 */
  defaultCategory: string;
  
  /** 主题模式 */
  theme: 'light' | 'dark' | 'auto';
  
  /** 界面语言 */
  language: 'zh' | 'en';
}

// ===== 工具函数 =====

/**
 * 获取所有可用的画集分类
 * 
 * @returns 分类枚举值数组
 */
export function getAvailableCategories(): CollectionCategoryType[] {
  return Object.values(CollectionCategory);
}

/**
 * 验证分类是否为有效值
 * 
 * @param category - 要验证的分类值
 * @returns 是否为有效分类
 */
export function isValidCategory(category: string): category is CollectionCategoryType {
  return Object.values(CollectionCategory).includes(category as any);
}

/**
 * 获取分类的显示名称 (枚举调用方式)
 */
export const CategoryDisplayName = {
  [CollectionCategory.COLLECTION]: '画集',
  [CollectionCategory.ACRYLIC]: '立牌',
  [CollectionCategory.BADGE]: '吧唧',
  [CollectionCategory.COLOR_PAPER]: '色纸',
  [CollectionCategory.TRANSPARENT_CARD]: '透卡',
  [CollectionCategory.POSTCARD]: '明信片',
  [CollectionCategory.LASER_TICKET]: '镭射票',
  [CollectionCategory.CANVAS_BAG]: '帆布包',
  [CollectionCategory.SPIRAL_NOTEBOOK]: '线圈笔记本',
  [CollectionCategory.MOUSE_PAD]: '鼠标垫',
  [CollectionCategory.SUPPORT_STICK]: '应援棒',
  [CollectionCategory.KEYCHAIN]: '挂件/钥匙扣',
  [CollectionCategory.OTHER]: '其它'
} as const;

/**
 * 获取分类的描述信息 (枚举调用方式)
 */
export const CategoryDescription = {
  [CollectionCategory.COLLECTION]: '用于展示艺术作品，包含多个作品页面的画集',
  [CollectionCategory.ACRYLIC]: '立牌制品，如亚克力立牌、展示立牌等',
  [CollectionCategory.BADGE]: '徽章类商品，如徽章、钥匙扣等',
  [CollectionCategory.COLOR_PAPER]: '彩色纸张制品，如彩色卡纸、彩色打印纸等',
  [CollectionCategory.TRANSPARENT_CARD]: '透明卡片制品，如透明卡片、透明卡等',
  [CollectionCategory.POSTCARD]: '明信片类商品，如艺术明信片、纪念明信片等',
  [CollectionCategory.LASER_TICKET]: '镭射票类商品，如演唱会门票、电影票等',
  [CollectionCategory.CANVAS_BAG]: '帆布包类商品，如帆布袋、帆布背包等',
  [CollectionCategory.SPIRAL_NOTEBOOK]: '线圈装订笔记本，如线圈笔记本、线圈装订笔记本等',
  [CollectionCategory.MOUSE_PAD]: '鼠标垫类商品，如鼠标垫、鼠标垫等',
  [CollectionCategory.SUPPORT_STICK]: '应援棒类商品，如荧光棒、应援棒等',
  [CollectionCategory.KEYCHAIN]: '挂件/钥匙扣类商品，如装饰挂件、钥匙扣等',
  [CollectionCategory.OTHER]: '挂件/钥匙扣类商品，如装饰挂件、钥匙扣等'
} as const;

// ===== 上下文类型导出 =====
export type { CartContextState } from './context'; 