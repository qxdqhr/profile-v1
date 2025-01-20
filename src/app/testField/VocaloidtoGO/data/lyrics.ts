import { LyricsData, Word } from '../types';

// 示例单词数据
const createWord = (
    id: string,
    text: string,
    reading: string,
    meaning: string,
    level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
    startIndex: number,
    endIndex: number,
    isKeyword: boolean = false
): Word => ({
    id,
    text,
    reading,
    meaning,
    level,
    startIndex,
    endIndex,
    isKeyword
});

// 千本桜的歌词数据
export const senbonzakuraLyrics: LyricsData = {
    songId: 'song1',
    lines: [
        {
            id: 'line1',
            startTime: 0,
            endTime: 4000,
            text: '大胆不敵にハイカラ革命',
            reading: 'だいたんふてきにハイカラかくめい',
            translation: '大胆不羁的文明开化',
            words: [
                createWord('word1', '大胆', 'だいたん', '大胆、勇敢', 'N4', 0, 2, true),
                createWord('word2', '不敵', 'ふてき', '大胆、不怕', 'N2', 2, 4),
                createWord('word3', 'ハイカラ', 'はいから', '新潮流的、摩登的', 'N2', 5, 9),
                createWord('word4', '革命', 'かくめい', '革命', 'N3', 9, 11, true)
            ]
        },
        {
            id: 'line2',
            startTime: 4000,
            endTime: 8000,
            text: '磊々落々（らいらいらくらく）反戦国家',
            reading: 'らいらいらくらくはんせんこっか',
            translation: '光明磊落的反战国家',
            words: [
                createWord('word5', '磊々落々', 'らいらいらくらく', '光明磊落', 'N1', 0, 4, true),
                createWord('word6', '反戦', 'はんせん', '反战', 'N3', 5, 7),
                createWord('word7', '国家', 'こっか', '国家', 'N4', 7, 9)
            ]
        }
    ],
    totalWords: 7,
    uniqueWords: 7,
    difficultyStats: {
        N5: 0,
        N4: 2,
        N3: 2,
        N2: 2,
        N1: 1
    }
};

// メルトの歌詞データ
export const meltLyrics: LyricsData = {
    songId: 'song2',
    lines: [
        {
            id: 'line1',
            startTime: 0,
            endTime: 4000,
            text: '朝目が覚めて',
            reading: 'あさめがさめて',
            translation: '早晨醒来',
            words: [
                createWord('word1', '朝', 'あさ', '早晨', 'N5', 0, 1),
                createWord('word2', '目', 'め', '眼睛', 'N5', 1, 2),
                createWord('word3', '覚める', 'さめる', '醒来', 'N4', 2, 4, true)
            ]
        },
        {
            id: 'line2',
            startTime: 4000,
            endTime: 8000,
            text: '真っ先に思い浮かぶ',
            reading: 'まっさきにおもいうかぶ',
            translation: '第一个想到的',
            words: [
                createWord('word4', '真っ先', 'まっさき', '首先', 'N3', 0, 3, true),
                createWord('word5', '思い浮かぶ', 'おもいうかぶ', '想起、浮现', 'N3', 4, 8, true)
            ]
        }
    ],
    totalWords: 5,
    uniqueWords: 5,
    difficultyStats: {
        N5: 2,
        N4: 1,
        N3: 2,
        N2: 0,
        N1: 0
    }
}; 