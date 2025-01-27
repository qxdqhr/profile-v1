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
export type GameType = 'disvariable' | 'downfalling' | 'upfalling' | 'leftfalling' | 'rightfalling' | 'leftrightsplit' | 'updownsplit'

// 游戏常量
// export const GRID_SIZE = 10
export const TILE_SIZE = typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 70  // 移动端40px，桌面端70px
export const TILE_GAP = typeof window !== 'undefined' && window.innerWidth < 768 ? 5 : 10    // 移动端5px，桌面端10px
export const TYPES_COUNT = 30
export const OUTER_PADDING = 1
export const GAME_DURATION = 300 // 游戏时长（秒）

// 游戏面板尺寸
export const GRID_WIDTH = typeof window !== 'undefined' && window.innerWidth < 768 ? 8 : 10  // 移动端8列，桌面端10列
export const GRID_HEIGHT = typeof window !== 'undefined' && window.innerWidth < 768 ? 7 : 8   // 移动端7行，桌面端8行 