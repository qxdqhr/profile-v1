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

export const TYPES_COUNT = 30
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