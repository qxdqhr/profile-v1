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

export enum GameMode {
  Text = 'text',
  Cube = 'cube'
}

export enum GameStatus {
  NotPlaying = 'notplaying',
  Playing = 'playing', 
  Success = 'success',
  Failed = 'failed'
}

export enum GameType {
  DisVariable = 'disvariable',
  DownFalling = 'downfalling',
  UpFalling = 'upfalling',
  LeftFalling = 'leftfalling',
  RightFalling = 'rightfalling',
  LeftRightSplit = 'leftrightsplit',
  UpDownSplit = 'updownsplit',
  Clockwise = 'clockwise',
  CounterClockwise = 'counterclockwise'
}

// 为 GameType 添加命名空间
export namespace GameType {
    // 添加静态属性
    export const defaultType: GameType = GameType.DisVariable;
    
    // 添加方法
    export function getDescription(type: GameType): string {
        switch (type) {
            case GameType.DisVariable:
                return '随机分布模式';
            case GameType.DownFalling:
                return '向下掉落模式';
            case GameType.UpFalling:
                return '向上浮动模式';
            case GameType.LeftFalling:
                return '向左移动模式';
            case GameType.RightFalling:
                return '向右移动模式';
            case GameType.LeftRightSplit:
                return '左右分裂模式';
            case GameType.UpDownSplit:
                return '上下分裂模式';
            case GameType.Clockwise:
                return '顺时针旋转模式';
            case GameType.CounterClockwise:
                return '逆时针旋转模式';
            default:
                return '未知模式';
        }
    }

    // 添加获取所有类型的方法
    export function getAllTypes(): GameType[] {
        return Object.values(GameType).filter(value => typeof value === 'string') as GameType[];
    }
}

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



// 添加设置接口
export interface GameSettings {
  gameType: GameType
  gridWidth: number
  gridHeight: number
  typesCount: number
  godMode: boolean  // 添加全能模式设置
} 