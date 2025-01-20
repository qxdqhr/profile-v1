import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameSession, GameSettings, GameProgress, Song } from '../types';

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
    playbackSpeed: 1.0
};

const initialSession: GameSession = {
    currentSong: null,
    isPlaying: false,
    startTime: null,
    endTime: null,
    settings: initialSettings,
    progress: {
        score: 0,
        combo: 0,
        maxCombo: 0,
        correctWords: [],
        wrongWords: [],
        timeSpent: 0
    }
};

export const useGameStore = create<GameStore>()(
    persist(
        (set, get) => ({
            // 初始状态
            session: initialSession,
            settings: initialSettings,

            // 动作实现
            startGame: async (songId: string) => {
                // 这里应该从数据服务加载完整的歌曲数据
                const song: Song = {
                    id: songId,
                    title: "Loading...",
                    artist: "Loading...",
                    difficulty: "N5",
                    duration: 0,
                    audioUrl: "",
                    coverUrl: "",
                    bpm: 0,
                    tags: []
                };

                set({
                    session: {
                        ...initialSession,
                        currentSong: song,
                        isPlaying: true,
                        startTime: Date.now()
                    }
                });

                // TODO: 实现歌曲数据加载逻辑
                // const loadedSong = await loadSongData(songId);
                // set(state => ({
                //     session: {
                //         ...state.session,
                //         currentSong: loadedSong
                //     }
                // }));
            },

            pauseGame: () => {
                set(state => ({
                    session: {
                        ...state.session,
                        isPlaying: false
                    }
                }));
            },

            resumeGame: () => {
                set(state => ({
                    session: {
                        ...state.session,
                        isPlaying: true
                    }
                }));
            },

            endGame: () => {
                set(state => ({
                    session: {
                        ...state.session,
                        isPlaying: false,
                        endTime: Date.now()
                    }
                }));
            },

            updateProgress: (progress) => {
                set(state => ({
                    session: {
                        ...state.session,
                        progress: {
                            ...state.session.progress,
                            ...progress,
                            maxCombo: Math.max(
                                state.session.progress.maxCombo,
                                progress.combo || state.session.progress.combo
                            )
                        }
                    }
                }));
            },

            updateSettings: (settings) => {
                set(state => ({
                    settings: {
                        ...state.settings,
                        ...settings
                    },
                    session: {
                        ...state.session,
                        settings: {
                            ...state.session.settings,
                            ...settings
                        }
                    }
                }));
            },

            resetSession: () => {
                set({ session: initialSession });
            }
        }),
        {
            name: 'vocaloid-to-go-game',
            partialize: (state) => ({ settings: state.settings })
        }
    )
); 