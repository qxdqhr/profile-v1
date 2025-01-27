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
export type GameType = 'disvariable' | 'downfalling' | 'upfalling' | 'leftfalling' | 'rightfalling'

// 游戏常量
// export const GRID_SIZE = 10
export const TILE_SIZE = 70
export const TILE_GAP = 10
export const TYPES_COUNT = 30
export const OUTER_PADDING = 1
export const GAME_DURATION = 300 // 游戏时长（秒）

// 游戏面板尺寸
export const GRID_WIDTH = 10  // 横向格子数
export const GRID_HEIGHT = 8  // 纵向格子数 