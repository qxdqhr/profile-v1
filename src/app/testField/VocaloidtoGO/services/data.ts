import { Song, LyricsData } from '../types';
import { sampleSongs } from '../data/songs';
import { senbonzakuraLyrics, meltLyrics } from '../data/lyrics';

// 模拟数据加载延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class DataService {
    private songs: Map<string, Song> = new Map();
    private lyrics: Map<string, LyricsData> = new Map();

    constructor() {
        // 初始化示例数据
        sampleSongs.forEach(song => this.songs.set(song.id, song));
        this.lyrics.set('song1', senbonzakuraLyrics);
        this.lyrics.set('song2', meltLyrics);
    }

    // 获取所有歌曲
    async getAllSongs(): Promise<Song[]> {
        await delay(500); // 模拟网络延迟
        return Array.from(this.songs.values());
    }

    // 获取单首歌曲
    async getSong(id: string): Promise<Song | null> {
        await delay(300);
        return this.songs.get(id) || null;
    }

    // 获取歌词数据
    async getLyrics(songId: string): Promise<LyricsData | null> {
        await delay(300);
        return this.lyrics.get(songId) || null;
    }

    // 按难度获取歌曲
    async getSongsByDifficulty(difficulty: Song['difficulty']): Promise<Song[]> {
        await delay(300);
        return Array.from(this.songs.values()).filter(
            song => song.difficulty === difficulty
        );
    }

    // 搜索歌曲
    async searchSongs(query: string): Promise<Song[]> {
        await delay(300);
        const lowerQuery = query.toLowerCase();
        return Array.from(this.songs.values()).filter(
            song =>
                song.title.toLowerCase().includes(lowerQuery) ||
                song.artist.toLowerCase().includes(lowerQuery) ||
                song.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    // 获取推荐歌曲
    async getRecommendedSongs(count: number = 3): Promise<Song[]> {
        await delay(300);
        const allSongs = Array.from(this.songs.values());
        const shuffled = [...allSongs].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
}

// 创建单例实例
export const dataService = new DataService(); 