'use client'
import { Stage } from '@pixi/react';
import { useState, useEffect, useCallback } from 'react';
import '@pixi/events';
import './styles.css';

import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './constants';

const RaceGame = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [gameRef, setGameRef] = useState<{ handleDirection?: (direction: 'up' | 'down' | 'left' | 'right') => void }>({});

    const handleStartGame = useCallback(() => {
        setGameStarted(true);
    }, []);

    const handleBackToMenu = useCallback(() => {
        setGameStarted(false);
    }, []);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="loading-screen">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="game-container">
            <Stage
                width={GAME_WIDTH}
                height={GAME_HEIGHT}
                options={{
                    backgroundColor: COLORS.BACKGROUND,
                    antialias: true,
                    eventMode: 'static',
                    eventFeatures: {
                        move: true,
                        globalMove: true,
                        click: true,
                        wheel: false
                    }
                }}
            >
                {!gameStarted ? (
                    <StartScreen onStartGame={handleStartGame} />
                ) : (
                    <GameScreen 
                        onRef={setGameRef} 
                        onBackToMenu={handleBackToMenu}
                    />
                )}
            </Stage>
        </div>
    );
};

export default RaceGame;
