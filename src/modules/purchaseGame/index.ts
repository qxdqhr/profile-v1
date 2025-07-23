/**
 * 购买游戏模块 - 主入口文件
 * 
 * 这是一个完整的购买商品小游戏模块，提供了从前端组件到后端API的完整解决方案。
 * 主要功能包括：
 * - 倒计时购买游戏
 * - 谋财/害命商品系统
 * - 生命值和源石锭管理
 * - 游戏结算和得分系统
 * - 响应式界面设计
 * 
 * 架构特点：
 * - 前后端分离，支持服务端渲染
 * - 模块化设计，便于维护和扩展
 * - TypeScript严格类型检查
 * - Tailwind CSS样式系统
 * 
 * @version 1.0.0
 * @author Profile-v1 Team
 */

// ===== 客户端组件导出 =====
// 这些组件用于构建用户界面，可以在客户端组件中使用

/** 游戏主页面组件 - 完整的游戏界面 */
export { GamePage } from './components/GamePage';

/** 倒计时进度条组件 - 显示游戏剩余时间 */
export { CountdownBar } from './components/CountdownBar';

/** 人物立绘展示组件 - 显示当前商品信息 */
export { CharacterDisplay } from './components/CharacterDisplay';

/** 游戏控制按钮组件 - 购买和跳过按钮 */
export { GameControls } from './components/GameControls';

/** 结算弹窗组件 - 游戏结束后的得分展示 */
export { SettlementModal } from './components/SettlementModal';

/** 帮助弹窗组件 - 游戏规则说明 */
export { HelpModal } from './components/HelpModal';

// ===== 页面组件导出 =====
// 完整的页面组件，可以直接用作路由页面

/** 购买游戏页面 - 完整的游戏页面 */
export { default as PurchaseGamePage } from './pages/page';

// ===== Hook导出 =====
// 自定义React Hooks，提供状态管理和业务逻辑封装

/** 购买游戏Hook - 提供游戏状态管理和操作方法 */
export { usePurchaseGame } from './hooks/usePurchaseGame';

// ===== 服务导出 =====
// 服务层，提供业务逻辑和数据操作

/** 游戏服务类 - 提供游戏核心逻辑 */
export { GameService, gameService } from './services/gameService';

/** 配置服务类 - 提供游戏配置管理 */
export { ConfigService, configService } from './services/configService';

// ===== 类型导出 =====
// TypeScript类型定义，确保类型安全

/** 
 * 导出所有相关的TypeScript类型定义
 * 包括数据模型、表单数据、状态管理等类型
 */
export type {
  // 游戏状态枚举
  GameStatus,
  ProductType,
  
  // 游戏配置类型
  GameConfig,
  
  // 商品类型
  Product,
  
  // 游戏状态类型
  GameState,
  
  // 购买记录类型
  PurchaseRecord,
  
  // API请求/响应类型
  InitGameRequest,
  InitGameResponse,
  PurchaseRequest,
  PurchaseResponse,
  SettleGameRequest,
  SettleGameResponse,
  
  // 组件Props类型
  GamePageProps,
  CountdownBarProps,
  CharacterDisplayProps,
  GameControlsProps,
  SettlementModalProps,
  HelpModalProps,
  
  // 数据库类型
  GameRecord,
  PurchaseRecordDB,
  
  // Hook返回类型
  UsePurchaseGameReturn,
  
  // 服务类型
  GameService as IGameService,
  ConfigService as IConfigService,
} from './types';

// ===== 模块信息 =====
/** 模块版本号 */
export const PURCHASE_GAME_MODULE_VERSION = '1.0.0';

/** 模块名称标识 */
export const PURCHASE_GAME_MODULE_NAME = '@profile-v1/purchaseGame';

// ===== 默认配置导出 =====
/** 默认游戏配置 */
export { DEFAULT_GAME_CONFIG } from './services/configService';

/** 默认商品配置 */
export { DEFAULT_PRODUCTS } from './services/configService';

// ===== 数据库Schema导出 =====
// 注意：这些只能在服务端使用，不要在客户端组件中导入
export {
  gameRecords,
  purchaseRecords,
  gameConfigs,
  productConfigs,
  gameRecordsRelations,
  purchaseRecordsRelations,
  type NewGameRecord,
  type NewPurchaseRecord,
  type NewGameConfig,
  type ProductConfig,
  type NewProductConfig,
} from './db/schema'; 