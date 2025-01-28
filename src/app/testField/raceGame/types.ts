export interface ButtonProps {
    text: string;
    x: number;
    y: number;
    onClick: () => void;
}

export interface StartScreenProps {
    onStartGame: () => void;
}

export interface CarProps {
    x: number;
    y: number;
}

export interface GameScreenProps {
    onRef: (ref: { handleDirection?: (direction: 'up' | 'down' | 'left' | 'right') => void }) => void;
    onBackToMenu: () => void;
}

export interface Obstacle {
    id: string;
    track: number;  // 所在轨道索引
    y: number;      // 垂直位置
    type: 'rock' | 'cone' | 'barrier';  // 障碍物类型
}

export interface Coin {
    id: string;
    track: number;  // 所在轨道索引
    y: number;      // 垂直位置
    collected: boolean;  // 是否已被收集
} 