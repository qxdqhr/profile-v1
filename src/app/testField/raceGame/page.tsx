'use client'
import { Stage } from '@pixi/react';
import { useState, useEffect, useCallback } from 'react';
import '@pixi/events';
import './styles.css';

import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './constants';
import { ControlPanel } from './components/ControlPanel';

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
            {gameStarted && gameRef.handleDirection && (
                <div className="control-wrapper">
                    <ControlPanel onDirectionPress={gameRef.handleDirection} />
                </div>
            )}
        </div>
    );
};

export default RaceGame;
