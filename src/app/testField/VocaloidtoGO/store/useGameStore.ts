import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameSession, GameSettings, GameProgress, GameMode } from '../types';

interface GameStore {
    // 状态
    session: GameSession;
    settings: GameSettings;
    
    // 动作
    startGame: (songId: string) => void;
    pauseGame: () => void;
    resumeGame: () => void;
    endGame: () => void;
    updateProgress: (progress: Partial<GameProgress>) => void;
    updateSettings: (settings: Partial<GameSettings>) => void;
    resetSession: () => void;
}

const initialSettings: GameSettings = {
    mode: 'practice',
    showReading: true,
    showTranslation: true,
    autoPlay: false,
    playbackSpeed: 1.0,
};

const initialProgress: GameProgress = {
    score: 0,
    combo: 0,
    maxCombo: 0,
    correctWords: [],
    wrongWords: [],
    timeSpent: 0,
};

const initialSession: GameSession = {
    settings: initialSettings,
    progress: initialProgress,
    currentSong: null,
    isPlaying: false,
    startTime: 0,
    endTime: null,
};

export const useGameStore = create<GameStore>()(
    persist(
        (set) => ({
            // 初始状态
            session: initialSession,
            settings: initialSettings,

            // 动作实现
            startGame: (songId: string) => set((state) => ({
                session: {
                    ...initialSession,
                    settings: state.settings,
                    startTime: Date.now(),
                    isPlaying: false,
                }
            })),

            pauseGame: () => set((state) => ({
                session: {
                    ...state.session,
                    isPlaying: true,
                }
            })),

            resumeGame: () => set((state) => ({
                session: {
                    ...state.session,
                    isPlaying: false,
                }
            })),

            endGame: () => set((state) => ({
                session: {
                    ...state.session,
                    endTime: Date.now(),
                    isPlaying: true,
                }
            })),

            updateProgress: (progress) => set((state) => ({
                session: {
                    ...state.session,
                    progress: {
                        ...state.session.progress,
                        ...progress,
                    }
                }
            })),

            updateSettings: (settings) => set((state) => ({
                settings: {
                    ...state.settings,
                    ...settings,
                },
                session: {
                    ...state.session,
                    settings: {
                        ...state.session.settings,
                        ...settings,
                    }
                }
            })),

            resetSession: () => set({
                session: initialSession,
            }),
        }),
        {
            name: 'game-storage',
            partialize: (state) => ({
                settings: state.settings, // 只持久化设置
            }),
        }
    )
); 