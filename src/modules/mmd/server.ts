/**
 * MMD模块 - 服务端专用导出
 * 
 * 此文件包含只能在服务端使用的功能：
 * - 数据库直接操作服务
 * - 文件处理工具
 * - API辅助函数
 * 
 * ⚠️ 注意：不要在客户端组件中导入此文件中的内容
 */

// ===== 数据库服务导出 =====
/** MMD模型数据库服务 */
export { 
  mmdModelsDbService,
  MMDModelsDbService 
} from './db/mmdDbService';

/** MMD动画数据库服务 */
export { 
  mmdAnimationsDbService,
  MMDAnimationsDbService 
} from './db/mmdDbService';

/** MMD音频数据库服务 */
export { 
  mmdAudiosDbService,
  MMDAudiosDbService 
} from './db/mmdDbService';

/** MMD场景数据库服务 */
export { 
  mmdScenesDbService,
  MMDScenesDbService 
} from './db/mmdDbService';

// ===== 数据库Schema导出 =====
/** 数据库表结构 */
export {
  mmdModels,
  mmdAnimations,
  mmdAudios,
  mmdScenes,
  mmdModelFavorites,
  mmdAnimationFavorites,
  // 关系定义
  mmdModelsRelations,
  mmdAnimationsRelations,
  mmdAudiosRelations,
  mmdScenesRelations,
  mmdModelFavoritesRelations,
  mmdAnimationFavoritesRelations,
} from './db/schema';

// ===== 工具函数导出 =====
// TODO: 待实现的服务端工具函数
// export { validateMMDFile } from './utils/fileValidation';
// export { processMMDUpload } from './utils/fileProcessing';
// export { generateThumbnail } from './utils/thumbnailGenerator';

// ===== 类型导出 =====
/** 服务端专用类型 */
export type {
  MMDModel,
  MMDAnimation,
  MMDAudio,
  MMDScene,
} from './types'; 