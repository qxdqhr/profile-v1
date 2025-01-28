import { Container, Graphics } from '@pixi/react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';
import { Car } from './Car';
import { GameScreenProps } from '../types';
import { ControlPanel } from './ControlPanel';

// 定义轨道位置
const TRACKS = [200, 350, 500, 650];
const INITIAL_Y = GAME_HEIGHT - 100; // 小车的初始垂直位置
const MOVE_SPEED = 10; // 移动速度
const MIN_Y = 50; // 最高位置
const MAX_Y = GAME_HEIGHT - 100; // 最低位置

export const GameScreen = ({ onRef }: GameScreenProps) => {
    const [currentTrack, setCurrentTrack] = useState(1); // 当前轨道索引（0-3）
    const [carY, setCarY] = useState(INITIAL_Y); // 小车的垂直位置
    const pressedKeys = useRef(new Set<string>());
    const animationFrameId = useRef<number>();

    // 处理方向控制
    const handleDirection = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        switch (direction) {
            case 'up':
                setCarY(prevY => Math.max(MIN_Y, prevY - MOVE_SPEED));
                break;
            case 'down':
                setCarY(prevY => Math.min(MAX_Y, prevY + MOVE_SPEED));
                break;
            case 'left':
                setCurrentTrack(prev => Math.max(0, prev - 1));
                break;
            case 'right':
                setCurrentTrack(prev => Math.min(TRACKS.length - 1, prev + 1));
                break;
        }
    }, []);

    // 更新游戏状态
    const updateGameState = useCallback(() => {
        // 处理垂直移动
        if (pressedKeys.current.has('ArrowUp')) {
            setCarY(prevY => Math.max(MIN_Y, prevY - MOVE_SPEED));
        }
        if (pressedKeys.current.has('ArrowDown')) {
            setCarY(prevY => Math.min(MAX_Y, prevY + MOVE_SPEED));
        }
        
        // 处理水平移动
        if (pressedKeys.current.has('ArrowLeft')) {
            setCurrentTrack(prev => Math.max(0, prev - 1));
        }
        if (pressedKeys.current.has('ArrowRight')) {
            setCurrentTrack(prev => Math.min(TRACKS.length - 1, prev + 1));
        }

        // 继续动画循环
        animationFrameId.current = requestAnimationFrame(updateGameState);
    }, []);

    // 处理键盘按下
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
            pressedKeys.current.add(event.key);
            
            // 如果还没有开始动画循环，就开始
            if (!animationFrameId.current) {
                animationFrameId.current = requestAnimationFrame(updateGameState);
            }
        }
    }, [updateGameState]);

    // 处理键盘松开
    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
            pressedKeys.current.delete(event.key);
            
            // 如果没有按键被按下，停止动画循环
            if (pressedKeys.current.size === 0 && animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = undefined;
            }
        }
    }, []);

    // 添加键盘事件监听
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [handleKeyDown, handleKeyUp]);

    // 暴露方向控制方法给父组件
    useEffect(() => {
        onRef({ handleDirection });
    }, [handleDirection, onRef]);

    return (
        <Container>
            {/* 背景和轨道 */}
            <Graphics
                draw={g => {
                    g.clear();
                    // 绘制背景
                    g.beginFill(COLORS.BACKGROUND);
                    g.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
                    g.endFill();
                    
                    // 绘制轨道
                    g.lineStyle(5, COLORS.TRACK_LINE, 0.4);
                    TRACKS.forEach(x => {
                        g.moveTo(x, 0);
                        g.lineTo(x, GAME_HEIGHT);
                    });

                    // 添加上下边界线
                    g.lineStyle(3, COLORS.TRACK_LINE, 0.6);
                    g.moveTo(0, MIN_Y);
                    g.lineTo(GAME_WIDTH, MIN_Y);
                    g.moveTo(0, MAX_Y);
                    g.lineTo(GAME_WIDTH, MAX_Y);
                }}
            />

            {/* 小车 */}
            <Car x={TRACKS[currentTrack]} y={carY} />
        </Container>
    );
}; 