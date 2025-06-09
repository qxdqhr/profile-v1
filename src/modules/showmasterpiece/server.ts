/**
 * ShowMasterpiece 模块 - 服务端专用导出
 * 
 * 这个文件包含了只能在服务端环境使用的功能导出，包括：
 * - 数据库操作服务
 * - 服务端配置管理
 * - API路由处理函数
 * 
 * ⚠️ 重要提示：
 * 这些导出只能在以下环境中使用：
 * - Next.js API路由 (app/api/*)
 * - 服务器组件 (Server Components)
 * - 服务端脚本和工具
 * 
 * 不要在客户端组件中导入此文件，否则会导致构建错误！
 * 
 * @usage
 * ```typescript
 * // 正确用法 - 在API路由中使用
 * import { masterpiecesConfigDbService } from '@/modules/showmasterpiece/server';
 * 
 * // 错误用法 - 不要在客户端组件中使用
 * 'use client';
 * import { masterpiecesConfigDbService } from '@/modules/showmasterpiece/server'; // ❌
 * ```
 */

// ===== 服务端专用导出 =====
// 这些只能在服务端使用（API路由、服务器组件等）

/**
 * 数据库操作服务导出
 * 
 * 这些服务提供了直接的数据库操作接口，包括：
 * - masterpiecesConfigDbService: 主配置管理
 * - categoriesDbService: 分类管理
 * - tagsDbService: 标签管理  
 * - collectionsDbService: 画集管理
 * - artworksDbService: 作品管理
 */
export { 
  masterpiecesConfigDbService,  // 主配置数据库服务
  categoriesDbService,          // 分类数据库服务
  tagsDbService,               // 标签数据库服务
  collectionsDbService,        // 画集数据库服务
  artworksDbService           // 作品数据库服务
} from './db/masterpiecesDbService';

/**
 * 服务端专用业务逻辑函数
 * 
 * 这些函数封装了复杂的业务逻辑，在服务端环境中提供高级操作：
 * - 支持事务处理
 * - 数据验证和清理
 * - 关联数据处理
 * - 批量操作优化
 */
export { 
  // === 配置管理 ===
  getConfig,        // 获取系统配置（包含默认值处理）
  updateConfig,     // 更新系统配置（包含验证）
  resetConfig,      // 重置配置为系统默认值
  
  // === 画集管理 ===
  getAllCollections,      // 获取所有画集（支持分页和排序）
  createCollection,       // 创建新画集（包含数据验证）
  updateCollection,       // 更新画集信息（支持部分更新）
  deleteCollection,       // 删除画集（级联删除关联作品）
  updateCollectionOrder,  // 批量更新画集显示顺序
  moveCollection,         // 移动画集到指定位置
  moveCollectionUp,       // 向上移动画集一位
  moveCollectionDown,     // 向下移动画集一位
  
  // === 作品管理 ===
  addArtworkToCollection, // 向画集添加新作品
  updateArtwork,         // 更新作品信息
  deleteArtwork,         // 删除作品（清理文件关联）
  getArtworksByCollection, // 获取指定画集的所有作品
  updateArtworkOrder,    // 批量更新作品顺序
  moveArtwork,           // 移动作品到指定位置
  moveArtworkUp,         // 向上移动作品一位
  moveArtworkDown,       // 向下移动作品一位
  
  // === 分类和标签管理 ===
  getCategories,         // 获取所有可用分类
  getTags,              // 获取所有可用标签
  getCollectionsOverview // 获取画集概览统计数据
} from './services/masterpiecesConfigService';

/**
 * 类型定义重新导出
 * 
 * 为了方便服务端代码使用，重新导出所有相关的TypeScript类型定义。
 * 这些类型与客户端使用的完全一致，确保数据结构的统一性。
 */
export type {
  ArtworkPage,        // 作品页面数据结构
  ArtCollection,      // 画集完整数据结构
  MasterpiecesConfig, // 系统配置数据结构
  ConfigFormData,     // 配置表单数据结构
  CollectionFormData, // 画集表单数据结构
  ArtworkFormData     // 作品表单数据结构
} from './types';
