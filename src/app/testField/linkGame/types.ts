export interface Tile {
  id: number
  type: number
  x: number
  y: number
  isSelected: boolean
  isMatched: boolean
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

export type GameStatus = 'playing' | 'paused' | 'failed' | 'success'

// 游戏常量
export const GRID_SIZE = 8
export const TILE_SIZE = 70
export const TILE_GAP = 10
export const TYPES_COUNT = 10
export const OUTER_PADDING = 1
export const GAME_DURATION = 10//300 // 游戏时长（秒） 