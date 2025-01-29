import { Container, Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { useCallback, useEffect, useState, useRef } from 'react';
import {
    GAME_WIDTH, GAME_HEIGHT, COLORS, TRACKS, INITIAL_Y,
    INITIAL_SPAWN_INTERVAL, INITIAL_OBSTACLE_SPEED, COLLISION_THRESHOLD,
    MIN_Y, VERTICAL_MOVE_SPEED, MAX_Y, BASE_SCORE_PER_SECOND,
    SPEED_INCREASE_INTERVAL, SPEED_INCREASE_RATE,
    MAX_OBSTACLE_SPEED, MIN_SPAWN_INTERVAL, HORIZONTAL_MOVE_COOLDOWN
} from '../constants';
import { Car } from './Car';
import { GameScreenProps } from '../types';
import { ScrollingBackground } from './ScrollingBackground';
import { Obstacle } from './Obstacle';
import { Coin } from './Coin';
import { Button, CircleButton } from './Button';
import { Obstacle as ObstacleType, Coin as CoinType } from '../types';
import '@pixi/events'

export const GameScreen = ({ onRef, onBackToMenu }: GameScreenProps) => {
    const [currentTrack, setCurrentTrack] = useState(1);
    const [carY, setCarY] = useState(INITIAL_Y);
    const [obstacles, setObstacles] = useState<ObstacleType[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [currentSpeed, setCurrentSpeed] = useState(INITIAL_OBSTACLE_SPEED);
    const [spawnInterval, setSpawnInterval] = useState(INITIAL_SPAWN_INTERVAL);
    const [isBackgroundPaused, setIsBackgroundPaused] = useState(false);
    const [shouldResetBackground, setShouldResetBackground] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [coins, setCoins] = useState<CoinType[]>([]);

    const gameLoopId = useRef<number>();
    const lastSpawnTime = useRef(0);
    const gameStartTime = useRef(Date.now());
    const lastScoreUpdate = useRef(Date.now());
    const lastSpeedIncrease = useRef(Date.now());
    const lastCoinSpawn = useRef(0);
    const COIN_SPAWN_INTERVAL = 3000; // 每3秒生成一个金币
    const lastHorizontalMove = useRef(0);  // 添加横向移动时间记录

    const scoreStyle = new TextStyle({
        fill: 0xffffff,
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 'bold'
    });

    const speedStyle = new TextStyle({
        fill: 0xffffff,
        fontSize: 16,
        fontFamily: 'Arial'
    });

    const gameOverStyle = new TextStyle({
        fill: 0xffffff,
        fontSize: 32,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        align: 'center'
    });

    const buttonStyle = new TextStyle({
        fill: COLORS.BUTTON_TEXT,
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 'bold'
    });
    // 更新得分
    const updateScore = useCallback(() => {
        const now = Date.now();
        const timeDiff = now - lastScoreUpdate.current;
        if (timeDiff >= 1000) { // 每秒更新一次得分
            const speedMultiplier = currentSpeed / INITIAL_OBSTACLE_SPEED;
            const scoreIncrease = Math.floor(BASE_SCORE_PER_SECOND * speedMultiplier);
            setScore(prev => prev + scoreIncrease);
            lastScoreUpdate.current = now;
        }
    }, [currentSpeed]);

    // 更新游戏速度
    const updateSpeed = useCallback(() => {
        const now = Date.now();
        const timeDiff = now - lastSpeedIncrease.current;

        if (timeDiff >= SPEED_INCREASE_INTERVAL) {
            setCurrentSpeed(prev => Math.min(MAX_OBSTACLE_SPEED, prev + SPEED_INCREASE_RATE));
            setSpawnInterval(prev => Math.max(MIN_SPAWN_INTERVAL, prev - 100));
            lastSpeedIncrease.current = now;
        }
    }, []);

    // 生成新障碍物
    const spawnObstacle = useCallback(() => {
        const now = Date.now();
        if (now - lastSpawnTime.current >= spawnInterval) {
            const newObstacle: ObstacleType = {
                id: Math.random().toString(),
                track: Math.floor(Math.random() * TRACKS.length),
                y: -50,
                type: ['rock', 'cone', 'barrier'][Math.floor(Math.random() * 3)] as ObstacleType['type']
            };
            setObstacles(prev => [...prev, newObstacle]);
            lastSpawnTime.current = now;
        }
    }, [spawnInterval]);

    // 生成新金币
    const spawnCoin = useCallback(() => {
        const now = Date.now();
        if (now - lastCoinSpawn.current >= COIN_SPAWN_INTERVAL) {
            const newCoin: CoinType = {
                id: Math.random().toString(),
                track: Math.floor(Math.random() * TRACKS.length),
                y: -50,
                collected: false
            };
            setCoins(prev => [...prev, newCoin]);
            lastCoinSpawn.current = now;
        }
    }, []);

    // 更新障碍物位置
    const updateObstacles = useCallback(() => {
        setObstacles(prev => {
            return prev
                .map(obstacle => ({
                    ...obstacle,
                    y: obstacle.y + currentSpeed * 2  // 使用实际速度
                }))
                .filter(obstacle => obstacle.y < GAME_HEIGHT);
        });
    }, [currentSpeed]);

    // 更新金币位置和检查收集
    const updateCoins = useCallback(() => {
        const carTrack = TRACKS[currentTrack];

        setCoins(prev => {
            return prev
                .map(coin => {
                    // 检查是否被收集
                    if (!coin.collected) {
                        const dx = Math.abs(carTrack - TRACKS[coin.track]);
                        const dy = Math.abs(carY - coin.y);

                        if (dx < COLLISION_THRESHOLD && dy < COLLISION_THRESHOLD) {
                            // 收集金币并增加分数
                            setScore(prevScore => prevScore + 1);
                            return { ...coin, collected: true };
                        }
                    }

                    // 更新位置，使用实际速度
                    return {
                        ...coin,
                        y: coin.y + currentSpeed * 2
                    };
                })
                .filter(coin => coin.y < GAME_HEIGHT || !coin.collected);
        });
    }, [currentTrack, carY, currentSpeed]);

    // 碰撞检测
    const checkCollisions = useCallback(() => {
        const carTrack = TRACKS[currentTrack];

        for (const obstacle of obstacles) {
            const obstacleX = TRACKS[obstacle.track];
            const dx = Math.abs(carTrack - obstacleX);
            const dy = Math.abs(carY - obstacle.y);

            if (dx < COLLISION_THRESHOLD && dy < COLLISION_THRESHOLD) {
                setIsGameOver(true);
                setIsBackgroundPaused(true);  // 游戏结束时暂停背景
                return true;
            }
        }
        return false;
    }, [obstacles, currentTrack, carY]);

    // 暂停/继续游戏
    const togglePause = useCallback(() => {
        if (!isGameOver) {
            setIsPaused(prev => !prev);
            setIsBackgroundPaused(prev => !prev);
        }
    }, [isGameOver]);

    // 更新游戏主循环
    const gameLoop = useCallback(() => {
        if (!isGameOver && !isPaused) {
            spawnObstacle();
            spawnCoin();  // 添加金币生成
            updateObstacles();
            updateCoins();  // 添加金币更新
            updateScore();
            updateSpeed();
            if (checkCollisions()) {
                if (gameLoopId.current) {
                    cancelAnimationFrame(gameLoopId.current);
                }
                return;
            }
            gameLoopId.current = requestAnimationFrame(gameLoop);
        }
    }, [spawnObstacle, updateObstacles, checkCollisions, isGameOver, updateScore, updateSpeed, isPaused, spawnCoin, updateCoins]);

    // 启动游戏循环
    useEffect(() => {
        gameLoopId.current = requestAnimationFrame(gameLoop);
        return () => {
            if (gameLoopId.current) {
                cancelAnimationFrame(gameLoopId.current);
            }
        };
    }, [gameLoop]);

    // 处理方向控制
    const handleDirection = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        if (isGameOver) return;

        const now = Date.now();

        switch (direction) {
            case 'up':
                setCarY(prevY => Math.max(MIN_Y, prevY - VERTICAL_MOVE_SPEED));
                break;
            case 'down':
                setCarY(prevY => Math.min(MAX_Y, prevY + VERTICAL_MOVE_SPEED));
                break;
            case 'left':
                if (now - lastHorizontalMove.current >= HORIZONTAL_MOVE_COOLDOWN) {
                    setCurrentTrack(prev => Math.max(0, prev - 1));
                    lastHorizontalMove.current = now;
                }
                break;
            case 'right':
                if (now - lastHorizontalMove.current >= HORIZONTAL_MOVE_COOLDOWN) {
                    setCurrentTrack(prev => Math.min(TRACKS.length - 1, prev + 1));
                    lastHorizontalMove.current = now;
                }
                break;
        }
    }, [isGameOver]);

    // 重置游戏状态
    const resetGame = useCallback(() => {
        // 先重置背景
        setShouldResetBackground(true);

        setCurrentTrack(1);
        setCarY(INITIAL_Y);
        setObstacles([]);
        setIsGameOver(false);
        setScore(0);
        setCurrentSpeed(INITIAL_OBSTACLE_SPEED);
        setSpawnInterval(INITIAL_SPAWN_INTERVAL);
        setIsBackgroundPaused(false);
        setCoins([]);  // 重置金币

        // 重置时间相关的 refs
        lastSpawnTime.current = Date.now();
        gameStartTime.current = Date.now();
        lastScoreUpdate.current = Date.now();
        lastSpeedIncrease.current = Date.now();
        lastCoinSpawn.current = Date.now();

        // 重新启动游戏循环
        if (gameLoopId.current) {
            cancelAnimationFrame(gameLoopId.current);
        }
        gameLoopId.current = requestAnimationFrame(gameLoop);

        // 在下一帧清除重置标志
        requestAnimationFrame(() => {
            setShouldResetBackground(false);
        });
    }, [gameLoop]);

    // 更新键盘事件处理
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
            if (!isPaused && !isGameOver) {
                const direction = event.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
                handleDirection(direction);
            }
        } else if (event.key === 'r' || event.key === 'R') {
            if (isGameOver || isPaused) {
                setIsPaused(false);
                resetGame();
            }
        } else if (event.key === 'Escape') {
            if (isGameOver || isPaused) {
                onBackToMenu();
            }
        } else if (event.key === 'p' || event.key === 'P') {
            if (!isGameOver) {
                togglePause();
            }
        }
    }, [handleDirection, isGameOver, resetGame, onBackToMenu, togglePause, isPaused]);

    // 添加键盘事件监听
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    // 暴露方向控制方法给父组件
    useEffect(() => {
        onRef({ handleDirection });
    }, [handleDirection, onRef]);

    // 暂停按钮样式
    const pauseButtonStyle = new TextStyle({
        fill: COLORS.BUTTON_TEXT,
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'bold'
    });

    return (
        <Container>
            <ScrollingBackground
                speed={currentSpeed}
                isPaused={isBackgroundPaused}
                shouldReset={shouldResetBackground}
            />

            {/* 上下边界线 */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.lineStyle(3, COLORS.TRACK_LINE, 0.6);
                    g.moveTo(0, MIN_Y);
                    g.lineTo(GAME_WIDTH, MIN_Y);
                    g.moveTo(0, MAX_Y);
                    g.lineTo(GAME_WIDTH, MAX_Y);
                }}
            />

            {/* 控制面板背景 */}
            <Graphics
                draw={g => {
                    g.clear();
                    g.beginFill(0x000000, 0.3);
                    g.drawRect(0, MAX_Y, GAME_WIDTH, GAME_HEIGHT - MAX_Y);
                    g.endFill();
                }}
            />

            {/* 渲染所有障碍物 */}
            {obstacles.map(obstacle => (
                <Obstacle key={obstacle.id} obstacle={obstacle} />
            ))}

            {/* 渲染金币 */}
            {coins.map(coin => (
                <Coin key={coin.id} coin={coin} />
            ))}

            {/* 小车 */}
            <Car x={TRACKS[currentTrack]} y={carY} />

            {/* 控制面板 */}
            <Container position={[GAME_WIDTH / 2, GAME_HEIGHT - 60]}>
                <CircleButton
                    x={-120}
                    y={0}
                    text="←"
                    onClick={() => handleDirection('left')}
                />
                <CircleButton
                    x={-40}
                    y={0}
                    text="↑"
                    onClick={() => handleDirection('up')}
                />
                <CircleButton
                    x={40}
                    y={0}
                    text="↓"
                    onClick={() => handleDirection('down')}
                />
                <CircleButton
                    x={120}
                    y={0}
                    text="→"
                    onClick={() => handleDirection('right')}
                />
            </Container>

            {/* 得分显示 */}
            <Text
                text={`得分: ${score}`}
                x={20}
                y={20}
                style={scoreStyle}
            />

            {/* 速度显示 */}
            <Text
                text={`速度: ${currentSpeed.toFixed(1)}x`}
                x={20}
                y={50}
                style={speedStyle}
            />

            {/* 暂停按钮 */}
            <Button
                text={isPaused ? "继续" : "暂停"}
                x={GAME_WIDTH - 60}
                y={20}
                width={100}
                height={30}
                onClick={togglePause}
                style={pauseButtonStyle}
            />

            {/* 暂停遮罩 */}
            {isPaused && !isGameOver && (
                <Container>
                    <Graphics
                        draw={g => {
                            g.clear();
                            g.beginFill(0x000000, 0.5);
                            g.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
                            g.endFill();
                        }}
                    />
                    <Text
                        text="游戏暂停"
                        x={GAME_WIDTH / 2}
                        y={GAME_HEIGHT / 2 - 80}
                        anchor={0.5}
                        style={gameOverStyle}
                    />

                    {/* 继续游戏按钮 */}
                    <Button
                        text="继续游戏"
                        x={GAME_WIDTH / 2}
                        y={GAME_HEIGHT / 2 + 60}
                        width={150}
                        height={50}
                        onClick={togglePause}
                    />

                    {/* 重新开始按钮 */}
                    <Button
                        text="重新开始"
                        x={GAME_WIDTH / 2}
                        y={GAME_HEIGHT / 2 + 120}
                        width={150}
                        height={50}
                        onClick={() => {
                            setIsPaused(false);
                            resetGame();
                        }}
                    />

                    <Button
                        text="返回主菜单"
                        x={GAME_WIDTH / 2}
                        y={GAME_HEIGHT / 2 + 180}
                        width={150}
                        height={50}
                        onClick={() => {
                            setIsPaused(false);
                            onBackToMenu();
                        }}
                    />
                </Container>
            )}

            {/* 游戏结束提示 */}
            {isGameOver && (
                <Container>
                    <Graphics
                        draw={g => {
                            g.clear();
                            g.beginFill(0x000000, 0.7);
                            g.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
                            g.endFill();
                        }}
                    />
                    <Text
                        text={`游戏结束!\n最终得分: ${score}`}
                        x={GAME_WIDTH / 2}
                        y={GAME_HEIGHT / 2 - 80}
                        anchor={0.5}
                        style={gameOverStyle}
                    />

                    {/* 重新开始按钮 */}
                    <Button
                        text="重新开始"
                        x={GAME_WIDTH / 2}
                        y={GAME_HEIGHT / 2 + 100}
                        width={150}
                        height={50}
                        onClick={() => {
                            setIsPaused(false);
                            resetGame();
                        }}
                    />

                    <Button
                        text="返回主菜单"
                        x={GAME_WIDTH / 2}
                        y={GAME_HEIGHT / 2 + 160}
                        width={150}
                        height={50}
                        onClick={() => {
                            setIsPaused(false);
                            onBackToMenu();
                        }}
                    />
                </Container>
            )}
        </Container>
    );
}; 