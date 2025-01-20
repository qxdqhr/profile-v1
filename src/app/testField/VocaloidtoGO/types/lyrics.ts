// 单个歌词行
export interface LyricLine {
    id: string;
    startTime: number;  // 开始时间（毫秒）
    endTime: number;    // 结束时间（毫秒）
    text: string;       // 原文
    reading: string;    // 假名读音
    translation: string; // 翻译
    words: Word[];      // 单词列表
}

// 单词信息
export interface Word {
    id: string;
    text: string;       // 原文
    reading: string;    // 假名读音
    meaning: string;    // 中文含义
    level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';  // JLPT等级
    startIndex: number; // 在原文中的起始位置
    endIndex: number;   // 在原文中的结束位置
    isKeyword: boolean; // 是否为关键词
}

// 完整歌词数据
export interface LyricsData {
    songId: string;
    lines: LyricLine[];
    totalWords: number;
    uniqueWords: number;
    difficultyStats: {
        N5: number;
        N4: number;
        N3: number;
        N2: number;
        N1: number;
    };
}

// 歌词同步状态
export interface LyricState {
    currentLineIndex: number;
    currentTime: number;
    isPlaying: boolean;
    highlightedWord: Word | null;
} 