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
} 