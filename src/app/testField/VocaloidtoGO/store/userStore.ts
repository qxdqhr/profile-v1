import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserStats, Song, Word, SongStats } from '../types';

interface UserStore {
    // 状态
    stats: UserStats;
    
    // 动作
    updatePlayTime: (seconds: number) => void;
    addPlayedSong: (song: Song) => void;
    updateSongStats: (songId: string, stats: Partial<SongStats>) => void;
    addLearnedWord: (word: Word) => void;
    addFavoriteWord: (word: Word) => void;
    removeFavoriteWord: (wordId: string) => void;
    updateDailyStreak: () => void;
    resetStats: () => void;
}

const initialStats: UserStats = {
    totalPlayTime: 0,
    songsPlayed: 0,
    wordsLearned: 0,
    dailyStreak: 0,
    songStats: {},
    recentSongs: [],
    favoriteWords: []
};

export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
            // 初始状态
            stats: initialStats,

            // 动作实现
            updatePlayTime: (seconds) => {
                set(state => ({
                    stats: {
                        ...state.stats,
                        totalPlayTime: state.stats.totalPlayTime + seconds
                    }
                }));
            },

            addPlayedSong: (song) => {
                set(state => {
                    const recentSongs = [
                        song,
                        ...state.stats.recentSongs.filter(s => s.id !== song.id)
                    ].slice(0, 10); // 保留最近10首

                    return {
                        stats: {
                            ...state.stats,
                            songsPlayed: state.stats.songsPlayed + 1,
                            recentSongs
                        }
                    };
                });
            },

            updateSongStats: (songId, stats) => {
                set(state => ({
                    stats: {
                        ...state.stats,
                        songStats: {
                            ...state.stats.songStats,
                            [songId]: {
                                ...state.stats.songStats[songId],
                                ...stats
                            }
                        }
                    }
                }));
            },

            addLearnedWord: (word) => {
                set(state => ({
                    stats: {
                        ...state.stats,
                        wordsLearned: state.stats.wordsLearned + 1
                    }
                }));
            },

            addFavoriteWord: (word) => {
                set(state => ({
                    stats: {
                        ...state.stats,
                        favoriteWords: [
                            ...state.stats.favoriteWords.filter(w => w.id !== word.id),
                            word
                        ]
                    }
                }));
            },

            removeFavoriteWord: (wordId) => {
                set(state => ({
                    stats: {
                        ...state.stats,
                        favoriteWords: state.stats.favoriteWords.filter(w => w.id !== wordId)
                    }
                }));
            },

            updateDailyStreak: () => {
                const lastUpdate = localStorage.getItem('lastStreakUpdate');
                const today = new Date().toDateString();

                if (lastUpdate !== today) {
                    localStorage.setItem('lastStreakUpdate', today);
                    set(state => ({
                        stats: {
                            ...state.stats,
                            dailyStreak: state.stats.dailyStreak + 1
                        }
                    }));
                }
            },

            resetStats: () => {
                set({ stats: initialStats });
            }
        }),
        {
            name: 'vocaloid-to-go-user',
            partialize: (state) => ({ stats: state.stats })
        }
    )
); 