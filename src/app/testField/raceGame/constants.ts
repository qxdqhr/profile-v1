// 根据设备宽度动态设置游戏尺寸
export const GAME_WIDTH = 375;  // iPhone SE 宽度
export const GAME_HEIGHT = 667; // iPhone SE 高度

export const COLORS = {
    BACKGROUND: 0x282c34,
    TRACK_LINE: 0xffffff,
    BUTTON_TEXT: 0xFFFFFF,
    BUTTON_FILL: 0x4CAF50,
};

// 轨道位置 - 调整为适合移动端的间距
export const TRACKS = [75, 165, 255, 345];  // 调整为更窄的赛道间距

// 游戏基础设置
export const INITIAL_Y = GAME_HEIGHT - 80;  // 调整初始位置
export const MOVE_SPEED = 8;  // 稍微降低移动速度以适应小屏
export const MIN_Y = 40;  // 调整上边界
export const MAX_Y = GAME_HEIGHT - 80;  // 调整下边界

// 障碍物相关
export const BASE_SPEED = 2;  // 降低基础速度
export const INITIAL_OBSTACLE_SPEED = BASE_SPEED;
export const MAX_OBSTACLE_SPEED = 6;  // 降低最大速度
export const INITIAL_SPAWN_INTERVAL = 2000;
export const MIN_SPAWN_INTERVAL = 1000;  // 增加最小生成间隔
export const COLLISION_THRESHOLD = 25;  // 调整碰撞检测范围

// 得分系统
export const BASE_SCORE_PER_SECOND = 1;
export const SPEED_INCREASE_INTERVAL = 12000;  // 增加速度提升间隔
export const SPEED_INCREASE_RATE = 0.15;  // 降低速度增加率