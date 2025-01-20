import { Song } from '../types';

export const sampleSongs: Song[] = [
    {
        id: 'song1',
        title: '千本桜',
        artist: '初音ミク',
        difficulty: 'N3',
        duration: 240, // 4分钟
        audioUrl: '/songs/senbonzakura.mp3',
        coverUrl: '/covers/senbonzakura.jpg',
        bpm: 154,
        tags: ['流行', '传统', '快节奏']
    },
    {
        id: 'song2',
        title: 'メルト',
        artist: '初音ミク',
        difficulty: 'N4',
        duration: 234, // 3分54秒
        audioUrl: '/songs/melt.mp3',
        coverUrl: '/covers/melt.jpg',
        bpm: 125,
        tags: ['流行', '恋爱', '经典']
    },
    {
        id: 'song3',
        title: '天ノ弱',
        artist: 'GUMI',
        difficulty: 'N3',
        duration: 200, // 3分20秒
        audioUrl: '/songs/amanojaku.mp3',
        coverUrl: '/covers/amanojaku.jpg',
        bpm: 200,
        tags: ['摇滚', '快节奏']
    }
]; 