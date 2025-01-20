export interface Song {
    id: string;
    title: string;
    artist: string;
    difficulty: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    duration: number;  // 歌曲时长（秒）
    audioUrl: string;  // 音频文件路径
    coverUrl: string;  // 封面图片路径
    bpm: number;      // 歌曲速度
    tags: string[];   // 标签（如：流行、摇滚等）
}

// 歌曲元数据，用于列表展示
export interface SongMeta {
    id: string;
    title: string;
    artist: string;
    difficulty: Song['difficulty'];
    coverUrl: string;
    duration: number;
}

// 歌曲统计信息
export interface SongStats {
    playCount: number;
    correctRate: number;
    lastPlayed: Date;
    bestScore: number;
    averageScore: number;
} 