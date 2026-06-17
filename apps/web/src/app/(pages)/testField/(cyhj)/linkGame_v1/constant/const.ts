import { GameType, Level } from './types'
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

export const SHUFFLE_COUNT = 5
export const TYPES_COUNT = 21
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

// 得分相关 
export const ONE_MATCH_SCORE = 10 // 每次匹配得分
export const REMAIN_TIME_SCORE = 2 // 剩余时间加分

export const TIMEOUT_DURATION = 300
export const GAME_TITLE = "葱韵环京连连看"
export const GAME_SUBTITLE = "Created by 焦糖布丁忆梦梦 皋月朔星"

// 修改关卡配置，移除锁定相关属性
export const GAME_LEVELS: Level[] = [
    {
        id: 1,
        name: "经典模式",
        gameType: GameType.DisVariable,
        description: "经典连连看玩法，方块保持不动"
    },
    {
        id: 2,
        name: "向下掉落",
        gameType: GameType.DownFalling,
        description: "消除后方块会向下掉落"
    },
    {
        id: 3,
        name: "向上浮动",
        gameType: GameType.UpFalling,
        description: "消除后方块会向上浮动"
    },
    {
        id: 4,
        name: "左右分裂",
        gameType: GameType.LeftRightSplit,
        description: "消除后方块会向两侧分裂"
    },
    {
        id: 5,
        name: "上下分裂",
        gameType: GameType.UpDownSplit,
        description: "消除后方块会向上下分裂"
    },
    {
        id: 6,
        name: "顺时针旋转",
        gameType: GameType.Clockwise,
        description: "消除后方块会顺时针旋转"
    },
    // {
    //   id: 7,
    //   name: "逆时针旋转",
    //   gameType: "counterclockwise",
    //   description: "消除后方块会逆时针旋转"
    // }
]

// 音效
export const SOUND_EFFECTS = {
    click: '/linkGame/sounds/click.mp3',
    match: '/linkGame/sounds/match.mp3'
};
// 预定义音乐列表
export const MUSIC_LIST = [
    { name: 'ShakeIt!-Miku', path: '/linkGame/mp3/ShakeIt!-Miku.mp3' },
    // ... 其他音乐
]


// 得分记录
export const SCORE_STORAGE_KEY = 'linkGame_scores';
export const MAX_RECORDS = 10;