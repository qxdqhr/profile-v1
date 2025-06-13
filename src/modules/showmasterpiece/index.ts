/**
 * ShowMasterpiece 模块 - 主入口文件
 * 
 * 这是一个完整的美术作品展示模块，提供了从前端组件到后端API的完整解决方案。
 * 主要功能包括：
 * - 美术作品画集的展示和浏览
 * - 画集和作品的管理配置界面
 * - 拖拽排序功能
 * - 缩略图预览
 * - 数据持久化存储
 * 
 * 架构特点：
 * - 前后端分离，支持服务端渲染
 * - 模块化设计，便于维护和扩展
 * - TypeScript严格类型检查
 * - CSS Modules样式隔离
 * 
 * @version 1.0.0
 * @author Profile-v1 Team
 */

// ===== 客户端组件导出 =====
// 这些组件用于构建用户界面，可以在客户端组件中使用

/** 画集卡片组件 - 用于展示画集封面和基本信息 */
export { CollectionCard } from './components/CollectionCard';

/** 作品查看器 - 用于展示单个作品的详细内容 */
export { ArtworkViewer } from './components/ArtworkViewer';

/** 缩略图侧边栏 - 用于展示作品集的缩略图导航 */
export { ThumbnailSidebar } from './components/ThumbnailSidebar';

/**
 * 通用顺序管理器组件
 * 
 * 抽象的通用排序组件，可以用于任何具有顺序的数据管理。
 * 通过传入操作函数和渲染函数来实现不同类型数据的排序功能。
 * 
 * 主要功能：
 * - 拖拽排序
 * - 上移/下移按钮
 * - 批量保存和重置
 * - 通用的错误处理和加载状态
 * 
 * 注意：此组件已迁移到 @/components/GenericOrderManager
 */
export { GenericOrderManager } from '@/components/GenericOrderManager';

/** 画集顺序管理器 - 基于通用组件的画集排序组件 */
export { CollectionOrderManagerV2 as CollectionOrderManager } from './components/CollectionOrderManagerV2';

/** 作品顺序管理器 - 基于通用组件的作品排序组件 */
export { ArtworkOrderManagerV2 as ArtworkOrderManager } from './components/ArtworkOrderManagerV2';


// ===== 页面组件导出 =====
// 完整的页面组件，可以直接用作路由页面

/** 美术作品展示主页面 - 展示所有画集的网格视图 */
export { default as ShowMasterPiecesPage } from './pages/ShowMasterPiecesPage';

/** 美术作品配置管理页面 - 后台管理界面，用于配置和管理画集数据 */
export { default as ShowMasterPiecesConfigPage } from './pages/config/page';

// ===== Hook导出 =====
// 自定义React Hooks，提供状态管理和业务逻辑封装

/** 美术作品数据管理Hook - 提供画集浏览的状态管理 */
export { useMasterpieces } from './hooks/useMasterpieces';

/** 美术作品配置管理Hook - 提供配置管理的状态和操作方法 */
export { useMasterpiecesConfig } from './hooks/useMasterpiecesConfig';

// ===== 客户端服务导出 =====
// 客户端API调用服务，封装了与后端的通信逻辑

/** 美术作品服务类 - 提供面向对象的API调用接口 */
export { MasterpiecesService } from './services/masterpiecesService';

/** 
 * 美术作品配置服务函数集
 * 包含所有与美术作品相关的CRUD操作和配置管理
 */
export { 
  // 配置管理
  getConfig,        // 获取系统配置
  updateConfig,     // 更新系统配置
  resetConfig,      // 重置配置为默认值
  
  // 画集管理
  getAllCollections,      // 获取所有画集
  createCollection,       // 创建新画集
  updateCollection,       // 更新画集信息
  deleteCollection,       // 删除画集
  updateCollectionOrder,  // 批量更新画集顺序
  moveCollection,         // 移动画集到指定位置
  moveCollectionUp,       // 向上移动画集
  moveCollectionDown,     // 向下移动画集
  
  // 作品管理
  addArtworkToCollection, // 向画集添加作品
  updateArtwork,         // 更新作品信息
  deleteArtwork,         // 删除作品
  getArtworksByCollection, // 获取画集中的所有作品
  updateArtworkOrder,    // 批量更新作品顺序
  moveArtwork,           // 移动作品到指定位置
  moveArtworkUp,         // 向上移动作品
  moveArtworkDown,       // 向下移动作品
  
  // 分类和标签
  getCategories,         // 获取所有分类
  getTags,              // 获取所有标签
  getCollectionsOverview // 获取画集概览数据
} from './services/masterpiecesConfigService';

// ===== 类型导出 =====
// TypeScript类型定义，确保类型安全

/** 
 * 导出所有相关的TypeScript类型定义
 * 包括数据模型、表单数据、状态管理等类型
 */
export type {
  MasterpiecesConfig,  // 系统配置类型
  ArtCollection,       // 画集数据类型
  ArtworkPage,         // 作品页面数据类型
  CollectionFormData,  // 画集表单数据类型
  ArtworkFormData,     // 作品表单数据类型
  MasterpiecesState,   // 画集浏览状态类型
  MasterpiecesActions  // 画集浏览操作类型
} from './types';

// ===== 模块信息 =====
/** 模块版本号 */
export const SHOWMASTERPIECE_MODULE_VERSION = '1.0.0';

/** 模块名称标识 */
export const SHOWMASTERPIECE_MODULE_NAME = '@profile-v1/showmasterpiece';

// ===== 服务端专用导出 =====
/**
 * 注意：以下导出只能在服务端使用，不要在客户端组件中导入
 * 
 * 服务端专用功能包括：
 * - 数据库直接操作
 * - 服务端配置管理
 * - API路由处理函数
 * 
 * 使用方式：
 * ```typescript
 * import { masterpiecesConfigDbService } from '@/modules/showmasterpiece/server';
 * ```
 * 
 * 详情请参考 ./server.ts 文件
 */
