// 检测是否为移动设备
const isMobile = typeof window !== 'undefined' && 
    (window.innerWidth <= 768 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0);

// 根据设备类型设置游戏尺寸
export const GAME_WIDTH = isMobile ? 375 : 600;  // 移动端375px，PC端600px
export const GAME_HEIGHT = isMobile ? 667 : 800; // 移动端适配iPhone SE，PC端更大

export const COLORS = {
    BACKGROUND: 0x282c34,
    TRACK_LINE: 0xffffff,
    BUTTON_TEXT: 0xFFFFFF,
    BUTTON_FILL: 0x4CAF50,
};

// 根据游戏宽度计算轨道位置
const trackSpacing = GAME_WIDTH / 5;  // 将游戏宽度分成5份
export const TRACKS = [
    trackSpacing,
    trackSpacing * 2,
    trackSpacing * 3,
    trackSpacing * 4
];

// 游戏基础设置
export const INITIAL_Y = GAME_HEIGHT - 120;  // 调整初始位置
export const VERTICAL_MOVE_SPEED = GAME_HEIGHT * 0.015;  // 垂直移动速度
export const HORIZONTAL_MOVE_COOLDOWN = 200;  // 横向移动冷却时间（毫秒）
export const MIN_Y = 40;  // 上边界
export const MAX_Y = GAME_HEIGHT - 120;  // 下边界，为控制按钮留出空间

// 障碍物相关
export const BASE_SPEED = isMobile ? 2 : 3;  // PC端基础速度更快
export const INITIAL_OBSTACLE_SPEED = BASE_SPEED;
export const MAX_OBSTACLE_SPEED = isMobile ? 6 : 8;  // PC端最大速度更快
export const INITIAL_SPAWN_INTERVAL = 2000;
export const MIN_SPAWN_INTERVAL = 1000;
export const COLLISION_THRESHOLD = GAME_WIDTH * 0.05;  // 碰撞检测范围根据屏幕宽度调整

// 得分系统
export const BASE_SCORE_PER_SECOND = 1;
export const SPEED_INCREASE_INTERVAL = 12000;
export const SPEED_INCREASE_RATE = 0.15;