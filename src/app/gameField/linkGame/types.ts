export interface Tile {
  id: number
  type: number
  x: number
  y: number
  isSelected: boolean
  isMatched: boolean
  targetY?: number
}

export interface PathPoint {
  x: number
  y: number
}

export interface MidiNote {
  name: string
  duration: number
  time: number
  velocity: number
}

export type GameMode = 'text' | 'cube'
export type GameStatus = 'playing' | 'success' | 'failed'
export type GameType = 'disvariable' | 'downfalling' | 'upfalling' | 'leftfalling' | 'rightfalling' | 'leftrightsplit' | 'updownsplit' | 'clockwise' | 'counterclockwise'

// 游戏常量
// export const GRID_SIZE = 10
export const TILE_SIZE = typeof window !== 'undefined' 
  ? window.innerWidth <= 375 
    ? 35  // 超小屏幕（如iPhone SE）
    : window.innerWidth < 768 
      ? 40  // 普通移动端
      : 70  // 桌面端
  : 70

export const TILE_GAP = typeof window !== 'undefined'
  ? window.innerWidth <= 375
    ? 3   // 超小屏幕
    : window.innerWidth < 768
      ? 5   // 普通移动端
      : 10  // 桌面端
  : 10

export const TYPES_COUNT = 15
export const OUTER_PADDING = typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 1
export const GAME_DURATION = 300 // 游戏时长（秒）

// 游戏面板尺寸
export const GRID_WIDTH = typeof window !== 'undefined'
  ? window.innerWidth <= 375
    ? 6   // 超小屏幕
    : window.innerWidth < 768
      ? 8   // 普通移动端
      : 10  // 桌面端
  : 10

export const GRID_HEIGHT = typeof window !== 'undefined'
  ? window.innerWidth <= 375
    ? 8   // 超小屏幕
    : window.innerWidth < 768
      ? 7   // 普通移动端
      : 8   // 桌面端
  : 8 

export interface ScoreRecord {
    score: number;
    date: string;
    gameType: GameType;
    gridSize: string;
    duration: number;
}

export interface Level {
  id: number
  name: string
  gameType: GameType
  description: string
}

// 修改关卡配置，移除锁定相关属性
export const GAME_LEVELS: Level[] = [
  {
    id: 1,
    name: "经典模式",
    gameType: "disvariable",
    description: "经典连连看玩法，方块保持不动"
  },
  {
    id: 2,
    name: "向下掉落",
    gameType: "downfalling",
    description: "消除后方块会向下掉落"
  },
  {
    id: 3,
    name: "向上浮动",
    gameType: "upfalling",
    description: "消除后方块会向上浮动"
  },
  {
    id: 4,
    name: "左右分裂",
    gameType: "leftrightsplit",
    description: "消除后方块会向两侧分裂"
  },
  {
    id: 5,
    name: "上下分裂",
    gameType: "updownsplit",
    description: "消除后方块会向上下分裂"
  },
  {
    id: 6,
    name: "顺时针旋转",
    gameType: "clockwise",
    description: "消除后方块会顺时针旋转"
  },
  {
    id: 7,
    name: "逆时针旋转",
    gameType: "counterclockwise",
    description: "消除后方块会逆时针旋转"
  }
]

// 添加设置接口
export interface GameSettings {
  gameType: GameType
  gridWidth: number
  gridHeight: number
  typesCount: number
  godMode: boolean  // 添加全能模式设置
} 