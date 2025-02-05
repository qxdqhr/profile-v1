
export interface LevelConfig {
  id: number
  targetScore: number
  timeLimit: number
  objects: {
    gold: number
    stone: number
    diamond: number
  }
}

export interface GameData {
  levels: LevelConfig[]
  highScores: Record<number, number>
  settings: {
    soundEnabled: boolean
    musicEnabled: boolean
  }
} 