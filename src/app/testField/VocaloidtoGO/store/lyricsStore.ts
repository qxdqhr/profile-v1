import { create } from 'zustand';
import { LyricsData, Word } from '../types';

interface LyricState {
    currentLineIndex: number;
    currentWordIndex: number;
    highlightedWord: Word | null;
}

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
    currentWordIndex: 0,
    highlightedWord: null
};

export const useLyricsStore = create<LyricsStore>((set, get) => ({
    // 初始状态
    currentLyrics: null,
    lyricState: initialLyricState,

    // 动作实现
    loadLyrics: (lyrics) => {
        set({
            currentLyrics: lyrics,
            lyricState: initialLyricState
        });
    },

    updateTime: (time) => {
        const { currentLyrics } = get();
        if (!currentLyrics) return;

        const newLineIndex = currentLyrics.lines.findIndex(
            (line, index) => {
                const nextLine = currentLyrics.lines[index + 1];
                return (
                    time >= line.startTime &&
                    (!nextLine || time < nextLine.startTime)
                );
            }
        );

        if (newLineIndex !== -1) {
            set(state => ({
                lyricState: {
                    ...state.lyricState,
                    currentLineIndex: newLineIndex
                }
            }));
        }
    },

    highlightWord: (word) => {
        set(state => ({
            lyricState: {
                ...state.lyricState,
                highlightedWord: word
            }
        }));
    },

    setPlaying: (isPlaying) => {
        // 可以在这里添加播放状态相关的逻辑
    },

    reset: () => {
        set({
            currentLyrics: null,
            lyricState: initialLyricState
        });
    }
})); 