/**
 * 购买游戏模块游戏服务
 */

import { 
  GameState, 
  GameStatus, 
  Product, 
  ProductType, 
  PurchaseRecord, 
  InitGameResponse, 
  PurchaseResponse, 
  SettleGameResponse,
  GameRecord
} from '../types';
import { configService } from './configService';

/**
 * 游戏服务类
 */
export class GameService {
  private static instance: GameService;
  private currentGameState: GameState | null = null;
  private gameStartTime: Date | null = null;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  /**
   * 初始化游戏
   */
  public async initGame(userId?: string): Promise<InitGameResponse> {
    try {
      const config = configService.getGameConfig();
      const randomProduct = configService.getRandomProduct();

      this.currentGameState = {
        status: GameStatus.PLAYING,
        currentLife: config.initialLife,
        currentMoney: config.initialMoney,
        currentProduct: randomProduct,
        timeRemaining: config.countdownTime,
        totalScore: 0,
        purchaseHistory: [],
      };

      this.gameStartTime = new Date();

      // TODO: 保存游戏记录到数据库
      console.log('Game initialized for user:', userId);

      return {
        success: true,
        gameState: { ...this.currentGameState },
        message: '游戏初始化成功',
      };
    } catch (error) {
      console.error('Failed to initialize game:', error);
      return {
        success: false,
        gameState: this.getDefaultGameState(),
        message: '游戏初始化失败',
      };
    }
  }

  /**
   * 购买商品
   */
  public async purchaseProduct(userId: string | undefined, productId: string): Promise<PurchaseResponse> {
    try {
      if (!this.currentGameState || this.currentGameState.status !== GameStatus.PLAYING) {
        return {
          success: false,
          gameState: this.getDefaultGameState(),
          error: '游戏未开始或已结束',
        };
      }

      const currentProduct = this.currentGameState.currentProduct;
      if (!currentProduct || currentProduct.id !== productId) {
        return {
          success: false,
          gameState: this.currentGameState,
          error: '商品不存在或已过期',
        };
      }

      // 检查是否可以购买
      if (!configService.canPurchaseProduct(
        currentProduct, 
        this.currentGameState.currentLife, 
        this.currentGameState.currentMoney
      )) {
        return {
          success: false,
          gameState: this.currentGameState,
          error: '资源不足，无法购买',
        };
      }

      // 计算得分
      const score = configService.calculateProductScore(
        currentProduct,
        this.currentGameState.currentLife,
        this.currentGameState.currentMoney
      );

      // 更新游戏状态
      if (currentProduct.type === ProductType.MONEY) {
        this.currentGameState.currentMoney -= currentProduct.value;
      } else {
        this.currentGameState.currentLife -= currentProduct.value;
      }

      this.currentGameState.totalScore += score;

      // 记录购买历史
      const purchaseRecord: PurchaseRecord = {
        id: `purchase_${Date.now()}`,
        productId: currentProduct.id,
        productName: currentProduct.name,
        productType: currentProduct.type,
        value: currentProduct.value,
        timestamp: new Date(),
        score,
      };

      this.currentGameState.purchaseHistory.push(purchaseRecord);

      // 检查游戏是否结束（生命值为0或负数时立即结束）
      if (this.currentGameState.currentLife <= 0) {
        this.currentGameState.status = GameStatus.FINISHED;
        this.currentGameState.currentLife = 0; // 确保生命值不会显示负数
        console.log('Game ended due to life reaching 0');
      } else {
        // 生命值大于0时，生成新的商品继续游戏
        this.currentGameState.currentProduct = configService.getRandomProduct();
      }

      // TODO: 保存购买记录到数据库
      console.log('Product purchased:', currentProduct.name, 'Score:', score);

      return {
        success: true,
        gameState: { ...this.currentGameState },
        message: `成功购买 ${currentProduct.name}，获得 ${score} 分`,
      };
    } catch (error) {
      console.error('Failed to purchase product:', error);
      return {
        success: false,
        gameState: this.currentGameState || this.getDefaultGameState(),
        error: '购买失败',
      };
    }
  }

  /**
   * 跳过当前商品
   */
  public skipProduct(): void {
    if (this.currentGameState && this.currentGameState.status === GameStatus.PLAYING) {
      this.currentGameState.currentProduct = configService.getRandomProduct();
    }
  }

  /**
   * 结算游戏
   */
  public async settleGame(userId?: string): Promise<SettleGameResponse> {
    try {
      if (!this.currentGameState) {
        return {
          success: false,
          finalScore: 0,
          totalPurchases: 0,
          gameDuration: 0,
          message: '没有进行中的游戏',
        };
      }

      const gameDuration = this.gameStartTime 
        ? Math.floor((Date.now() - this.gameStartTime.getTime()) / 1000)
        : 0;

      const totalPurchases = this.currentGameState.purchaseHistory.length;
      const finalScore = this.currentGameState.totalScore;

      // 更新游戏状态
      this.currentGameState.status = GameStatus.FINISHED;

      // TODO: 保存游戏记录到数据库
      console.log('Game settled:', {
        userId,
        finalScore,
        totalPurchases,
        gameDuration,
      });

      return {
        success: true,
        finalScore,
        totalPurchases,
        gameDuration,
        message: '游戏结算完成',
      };
    } catch (error) {
      console.error('Failed to settle game:', error);
      return {
        success: false,
        finalScore: 0,
        totalPurchases: 0,
        gameDuration: 0,
        message: '游戏结算失败',
      };
    }
  }

  /**
   * 获取游戏历史
   */
  public async getGameHistory(userId?: string): Promise<GameRecord[]> {
    try {
      // TODO: 从数据库获取游戏历史
      console.log('Getting game history for user:', userId);
      return [];
    } catch (error) {
      console.error('Failed to get game history:', error);
      return [];
    }
  }

  /**
   * 获取当前游戏状态
   */
  public getCurrentGameState(): GameState | null {
    return this.currentGameState ? { ...this.currentGameState } : null;
  }

  /**
   * 更新倒计时
   */
  public updateCountdown(timeRemaining: number): void {
    if (this.currentGameState && this.currentGameState.status === GameStatus.PLAYING) {
      this.currentGameState.timeRemaining = timeRemaining;
      
      // 时间到，游戏结束
      if (timeRemaining <= 0) {
        this.currentGameState.status = GameStatus.FINISHED;
      }
    }
  }

  /**
   * 重置游戏
   */
  public resetGame(): void {
    this.currentGameState = null;
    this.gameStartTime = null;
  }

  /**
   * 获取默认游戏状态
   */
  private getDefaultGameState(): GameState {
    const config = configService.getGameConfig();
    return {
      status: GameStatus.IDLE,
      currentLife: config.initialLife,
      currentMoney: config.initialMoney,
      currentProduct: null,
      timeRemaining: config.countdownTime,
      totalScore: 0,
      purchaseHistory: [],
    };
  }
}

// 导出单例实例
export const gameService = GameService.getInstance(); 