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

// 游戏常量
export const GRID_SIZE = 8
export const TILE_SIZE = 60
export const TYPES_COUNT = 10
export const OUTER_PADDING = 1 