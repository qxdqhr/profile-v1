export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 800;

export const COLORS = {
    BACKGROUND: 0x282c34,
    TRACK_LINE: 0xffffff,
    BUTTON_TEXT: 0xFFFFFF,
    BUTTON_FILL: 0x4CAF50,
};

// 轨道位置 - 根据图片中的赛道位置调整
export const TRACKS = [160, 320, 480, 640];  // 调整为四条赛道的中心位置

// 游戏基础设置
export const INITIAL_Y = GAME_HEIGHT - 100;
export const MOVE_SPEED = 10;
export const MIN_Y = 50;
export const MAX_Y = GAME_HEIGHT - 100;

// 障碍物相关
export const BASE_SPEED = 3;  // 基础移动速度
export const INITIAL_OBSTACLE_SPEED = BASE_SPEED;  // 初始障碍物速度
export const MAX_OBSTACLE_SPEED = 8;      // 最大障碍物速度
export const INITIAL_SPAWN_INTERVAL = 2000;  // 初始生成间隔
export const MIN_SPAWN_INTERVAL = 800;    // 最小生成间隔
export const COLLISION_THRESHOLD = 30;

// 得分系统
export const BASE_SCORE_PER_SECOND = 1;   // 基础每秒得分
export const SPEED_INCREASE_INTERVAL = 10000; // 每10秒增加速度
export const SPEED_INCREASE_RATE = 0.2;   // 速度增加率