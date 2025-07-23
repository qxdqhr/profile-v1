/**
 * 购买游戏模块类型定义
 */

// ===== 游戏状态枚举 =====
export enum GameStatus {
  IDLE = 'idle',           // 空闲状态
  PLAYING = 'playing',     // 游戏中
  PAUSED = 'paused',       // 暂停
  FINISHED = 'finished'    // 游戏结束
}

export enum ProductType {
  MONEY = 'money',         // 谋财 - 扣减源石锭
  LIFE = 'life'            // 害命 - 扣减生命值
}

// ===== 游戏配置类型 =====
export interface GameConfig {
  initialLife: number;     // 初始生命值
  initialMoney: number;    // 初始源石锭
  countdownTime: number;   // 倒计时时间（秒）
  minProductValue: number; // 最小商品价值
  maxProductValue: number; // 最大商品价值
}

// ===== 商品类型 =====
export interface Product {
  id: string;              // 商品ID
  name: string;            // 商品名称
  type: ProductType;       // 商品类型
  value: number;           // 商品价值
  description: string;     // 商品描述
  imageUrl?: string;       // 商品图片URL
}

// ===== 游戏状态类型 =====
export interface GameState {
  status: GameStatus;      // 游戏状态
  currentLife: number;     // 当前生命值
  currentMoney: number;    // 当前源石锭
  currentProduct: Product | null; // 当前商品
  timeRemaining: number;   // 剩余时间
  totalScore: number;      // 总积分
  purchaseHistory: PurchaseRecord[]; // 购买历史
}

// ===== 购买记录类型 =====
export interface PurchaseRecord {
  id: string;              // 记录ID
  productId: string;       // 商品ID
  productName: string;     // 商品名称
  productType: ProductType; // 商品类型
  value: number;           // 商品价值
  timestamp: Date;         // 购买时间
  score: number;           // 本次购买得分
}

// ===== API请求/响应类型 =====
export interface InitGameRequest {
  userId?: string;         // 用户ID（可选）
}

export interface InitGameResponse {
  success: boolean;
  gameState: GameState;
  message?: string;
}

export interface PurchaseRequest {
  userId?: string;         // 用户ID（可选）
  productId: string;       // 商品ID
}

export interface PurchaseResponse {
  success: boolean;
  gameState: GameState;
  message?: string;
  error?: string;
}

export interface SettleGameRequest {
  userId?: string;         // 用户ID（可选）
}

export interface SettleGameResponse {
  success: boolean;
  finalScore: number;
  totalPurchases: number;
  gameDuration: number;
  message?: string;
}

// ===== 组件Props类型 =====
export interface GamePageProps {
  userId?: string;
}

export interface CountdownBarProps {
  timeRemaining: number;
  totalTime: number;
  isActive: boolean;
}

export interface CharacterDisplayProps {
  product: Product | null;
  isAnimating: boolean;
}

export interface GameControlsProps {
  onPurchase: () => void;
  onSkip: () => void;
  disabled: boolean;
  currentProduct: Product | null;
  currentLife: number;
}

export interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  finalScore: number;
  totalPurchases: number;
  gameDuration: number;
}

export interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ===== 数据库类型 =====
export interface GameRecord {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  finalScore: number;
  totalPurchases: number;
  gameDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseRecordDB {
  id: string;
  gameId: string;
  productId: string;
  productName: string;
  productType: ProductType;
  value: number;
  score: number;
  timestamp: Date;
  createdAt: Date;
}

// ===== Hook返回类型 =====
export interface UsePurchaseGameReturn {
  gameState: GameState;
  isLoading: boolean;
  error: string | null;
  initGame: () => Promise<void>;
  purchaseProduct: () => Promise<void>;
  skipProduct: () => void;
  settleGame: () => Promise<void>;
  resetGame: () => void;
}

// ===== 服务类型 =====
export interface GameService {
  initGame(userId?: string): Promise<InitGameResponse>;
  purchaseProduct(userId: string | undefined, productId: string): Promise<PurchaseResponse>;
  settleGame(userId?: string): Promise<SettleGameResponse>;
  getGameHistory(userId?: string): Promise<GameRecord[]>;
}

export interface ConfigService {
  getGameConfig(): GameConfig;
  getProducts(): Product[];
  updateGameConfig(config: Partial<GameConfig>): Promise<void>;
} 