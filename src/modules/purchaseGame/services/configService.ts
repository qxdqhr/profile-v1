/**
 * 购买游戏模块配置服务
 */

import { GameConfig, Product, ProductType } from '../types';

// ===== 默认游戏配置 =====
export const DEFAULT_GAME_CONFIG: GameConfig = {
  initialLife: 3,
  initialMoney: 100,
  countdownTime: 30,
  minProductValue: 10,
  maxProductValue: 50,
};

// ===== 默认商品配置 =====
export const DEFAULT_PRODUCTS: Product[] = [
  // 谋财类商品
  {
    id: 'money_1',
    name: '神秘宝箱',
    type: ProductType.MONEY,
    value: 15,
    description: '一个神秘的宝箱，里面可能有珍贵的物品',
  },
  {
    id: 'money_2',
    name: '古老金币',
    type: ProductType.MONEY,
    value: 25,
    description: '一枚古老的金币，散发着神秘的光芒',
  },
  {
    id: 'money_3',
    name: '魔法水晶',
    type: ProductType.MONEY,
    value: 35,
    description: '一块魔法水晶，蕴含着强大的能量',
  },
  {
    id: 'money_4',
    name: '稀有宝石',
    type: ProductType.MONEY,
    value: 45,
    description: '一颗稀有的宝石，价值连城',
  },
  
  // 害命类商品
  {
    id: 'life_1',
    name: '诅咒护符',
    type: ProductType.LIFE,
    value: 1,
    description: '一个被诅咒的护符，会吸取使用者的生命力',
  },
  {
    id: 'life_2',
    name: '黑暗契约',
    type: ProductType.LIFE,
    value: 2,
    description: '一份黑暗契约，签订者将失去部分生命',
  },
  {
    id: 'life_3',
    name: '死亡之吻',
    type: ProductType.LIFE,
    value: 1,
    description: '一个致命的吻，会带走使用者的生命',
  },
  {
    id: 'life_4',
    name: '灵魂收割者',
    type: ProductType.LIFE,
    value: 2,
    description: '一把收割灵魂的镰刀，使用者将失去生命',
  },
];

// ===== 商品图片映射 =====
export const PRODUCT_IMAGES = {
  // 谋财类商品图片
  money_1: '/images/purchase-game/money-box.png',
  money_2: '/images/purchase-game/money-coin.png',
  money_3: '/images/purchase-game/money-crystal.png',
  money_4: '/images/purchase-game/money-gem.png',
  
  // 害命类商品图片
  life_1: '/images/purchase-game/life-curse.png',
  life_2: '/images/purchase-game/life-contract.png',
  life_3: '/images/purchase-game/life-kiss.png',
  life_4: '/images/purchase-game/life-scythe.png',
};

/**
 * 配置服务类
 */
export class ConfigService {
  private static instance: ConfigService;
  private gameConfig: GameConfig;
  private products: Product[];

  private constructor() {
    this.gameConfig = { ...DEFAULT_GAME_CONFIG };
    this.products = [...DEFAULT_PRODUCTS];
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * 获取游戏配置
   */
  public getGameConfig(): GameConfig {
    return { ...this.gameConfig };
  }

  /**
   * 获取所有商品
   */
  public getProducts(): Product[] {
    return this.products.map(product => ({
      ...product,
      imageUrl: PRODUCT_IMAGES[product.id as keyof typeof PRODUCT_IMAGES] || undefined,
    }));
  }

  /**
   * 根据类型获取商品
   */
  public getProductsByType(type: ProductType): Product[] {
    return this.getProducts().filter(product => product.type === type);
  }

  /**
   * 随机获取一个商品
   */
  public getRandomProduct(): Product {
    const products = this.getProducts();
    const randomIndex = Math.floor(Math.random() * products.length);
    return products[randomIndex];
  }

  /**
   * 根据类型随机获取商品
   */
  public getRandomProductByType(type: ProductType): Product {
    const products = this.getProductsByType(type);
    const randomIndex = Math.floor(Math.random() * products.length);
    return products[randomIndex];
  }

  /**
   * 更新游戏配置
   */
  public async updateGameConfig(config: Partial<GameConfig>): Promise<void> {
    this.gameConfig = { ...this.gameConfig, ...config };
    
    // TODO: 保存到数据库
    console.log('Game config updated:', this.gameConfig);
  }

  /**
   * 重置游戏配置为默认值
   */
  public async resetGameConfig(): Promise<void> {
    this.gameConfig = { ...DEFAULT_GAME_CONFIG };
    
    // TODO: 保存到数据库
    console.log('Game config reset to default');
  }

  /**
   * 添加新商品
   */
  public async addProduct(product: Omit<Product, 'id'>): Promise<void> {
    const newProduct: Product = {
      ...product,
      id: `${product.type}_${Date.now()}`,
    };
    
    this.products.push(newProduct);
    
    // TODO: 保存到数据库
    console.log('Product added:', newProduct);
  }

  /**
   * 移除商品
   */
  public async removeProduct(productId: string): Promise<void> {
    this.products = this.products.filter(product => product.id !== productId);
    
    // TODO: 保存到数据库
    console.log('Product removed:', productId);
  }

  /**
   * 计算商品得分
   */
  public calculateProductScore(product: Product, currentLife: number, currentMoney: number): number {
    const baseScore = product.value;
    
    // 根据商品类型和当前状态计算得分
    if (product.type === ProductType.MONEY) {
      // 谋财类：源石锭越多，得分越高
      const moneyBonus = Math.floor(currentMoney / 10);
      return baseScore + moneyBonus;
    } else {
      // 害命类：生命值越少，得分越高
      const lifePenalty = (3 - currentLife) * 5;
      return baseScore + lifePenalty;
    }
  }

  /**
   * 检查是否可以购买商品
   */
  public canPurchaseProduct(product: Product, currentLife: number, currentMoney: number): boolean {
    if (product.type === ProductType.MONEY) {
      return currentMoney >= product.value;
    } else {
      // 允许购买生命值刚好等于商品价值的商品（购买后生命值为0，游戏结束）
      return currentLife >= product.value;
    }
  }
}

// 导出单例实例
export const configService = ConfigService.getInstance(); 