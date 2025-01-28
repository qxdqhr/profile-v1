import { Container, Sprite, useTick } from '@pixi/react';
import { useCallback, useState, useEffect } from 'react';
import { GAME_WIDTH, GAME_HEIGHT, BASE_SPEED } from '../constants';

interface ScrollingBackgroundProps {
    speed: number;
    isPaused: boolean;
    shouldReset?: boolean;  // 添加重置标志
}

export const ScrollingBackground = ({ speed, isPaused, shouldReset }: ScrollingBackgroundProps) => {
    const [offset, setOffset] = useState(0);

    // 监听重置标志
    useEffect(() => {
        if (shouldReset) {
            setOffset(0);  // 重置偏移量到初始位置
        }
    }, [shouldReset]);

    // 更新背景位置
    const onTick = useCallback(() => {
        if (!isPaused) {
            setOffset(prev => {
                // 使用实际的速度值
                const scrollSpeed = (speed / BASE_SPEED) * 3;  // 基础速度的倍数
                const newOffset = (prev + scrollSpeed) % GAME_HEIGHT;
                return newOffset;
            });
        }
    }, [speed, isPaused]);

    useTick(onTick);

    return (
        <Container>
            {/* 使用两张相同的图片实现无缝滚动 */}
            <Sprite 
                image="/raceGame/images/track.png"
                width={GAME_WIDTH}
                height={GAME_HEIGHT}
                y={-GAME_HEIGHT + offset}
                alpha={1}  // 完全不透明
            />
            <Sprite 
                image="/raceGame/images/track.png"
                width={GAME_WIDTH}
                height={GAME_HEIGHT}
                y={offset}
                alpha={1}  // 完全不透明
            />
        </Container>
    );
}; 