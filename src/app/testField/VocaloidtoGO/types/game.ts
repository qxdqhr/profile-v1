import { Word } from './lyrics';
import { Song, SongStats } from './song';

// 游戏模式
export type GameMode = 'practice' | 'challenge' | 'review';

// 游戏难度设置
export interface GameSettings {
    mode: GameMode;
    showReading: boolean;     // 是否显示假名
    showTranslation: boolean; // 是否显示翻译
    autoPlay: boolean;        // 是否自动播放下一首
    playbackSpeed: number;    // 播放速度 (0.5-2.0)
}

// 游戏进度
export interface GameProgress {
    score: number;
    combo: number;
    maxCombo: number;
    correctWords: Word[];
    wrongWords: Word[];
    timeSpent: number;
}

// 用户学习数据
export interface UserStats {
    totalPlayTime: number;
    songsPlayed: number;
    wordsLearned: number;
    dailyStreak: number;
    songStats: Record<string, SongStats>;
    recentSongs: Song[];
    favoriteWords: Word[];
}

// 游戏会话状态
export interface GameSession {
    currentSong: Song | null;
    isPlaying: boolean;
    startTime: number | null;
    endTime: number | null;
    progress: GameProgress;
    settings: GameSettings;
} 