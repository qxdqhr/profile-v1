import { create } from 'zustand';
import { LyricState, LyricLine, Word, LyricsData } from '../types';

interface LyricsStore {
    // 状态
    currentLyrics: LyricsData | null;
    lyricState: LyricState;
    
    // 动作
    loadLyrics: (lyrics: LyricsData) => void;
    updateTime: (time: number) => void;
    highlightWord: (word: Word | null) => void;
    setPlaying: (isPlaying: boolean) => void;
    reset: () => void;
}

const initialLyricState: LyricState = {
    currentLineIndex: 0,
    currentTime: 0,
    isPlaying: false,
    highlightedWord: null,
};

export const useLyricsStore = create<LyricsStore>((set, get) => ({
    // 初始状态
    currentLyrics: null,
    lyricState: initialLyricState,

    // 动作实现
    loadLyrics: (lyrics) => set({
        currentLyrics: lyrics,
        lyricState: initialLyricState,
    }),

    updateTime: (time) => set((state) => {
        if (!state.currentLyrics) return state;

        // 找到当前时间对应的歌词行
        const currentLineIndex = state.currentLyrics.lines.findIndex(
            (line) => time >= line.startTime && time <= line.endTime
        );

        return {
            lyricState: {
                ...state.lyricState,
                currentTime: time,
                currentLineIndex: currentLineIndex >= 0 ? currentLineIndex : state.lyricState.currentLineIndex,
            }
        };
    }),

    highlightWord: (word) => set((state) => ({
        lyricState: {
            ...state.lyricState,
            highlightedWord: word,
        }
    })),

    setPlaying: (isPlaying) => set((state) => ({
        lyricState: {
            ...state.lyricState,
            isPlaying,
        }
    })),

    reset: () => set({
        currentLyrics: null,
        lyricState: initialLyricState,
    }),
})); 