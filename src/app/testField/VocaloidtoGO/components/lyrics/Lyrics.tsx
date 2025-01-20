import React, { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { LyricLine } from './LyricLine';
import { useLyricsStore, useGameStore } from '../../store';
import { Word } from '../../types';
// import '@/app/testField/VocaloidtoGO/styles/components/lyrics/lyrics.css';

interface LyricsProps {
    className?: string;
}

export const Lyrics: React.FC<LyricsProps> = ({ className }) => {
    const { currentLyrics, lyricState, highlightWord } = useLyricsStore();
    const { updateProgress } = useGameStore();

    const handleWordClick = (word: Word) => {
        highlightWord(word);
        // TODO: 实现单词学习逻辑
        updateProgress({
            correctWords: [word], // 这里需要根据实际游戏逻辑判断正确与否
        });
    };

    // 计算要显示的歌词行范围
    const visibleLines = React.useMemo(() => {
        if (!currentLyrics) return [];

        const currentIndex = lyricState.currentLineIndex;
        const lines = currentLyrics.lines;
        const visibleCount = 5; // 显示的行数
        const halfVisible = Math.floor(visibleCount / 2);

        let startIndex = Math.max(0, currentIndex - halfVisible);
        let endIndex = Math.min(lines.length - 1, currentIndex + halfVisible);

        // 调整以确保始终显示固定行数
        while (endIndex - startIndex + 1 < visibleCount && (startIndex > 0 || endIndex < lines.length - 1)) {
            if (startIndex > 0) {
                startIndex--;
            }
            if (endIndex < lines.length - 1 && endIndex - startIndex + 1 < visibleCount) {
                endIndex++;
            }
        }

        return lines.slice(startIndex, endIndex + 1).map((line, index) => ({
            line,
            isActive: startIndex + index === currentIndex,
            isBefore: startIndex + index < currentIndex,
            isAfter: startIndex + index > currentIndex,
        }));
    }, [currentLyrics, lyricState.currentLineIndex]);

    if (!currentLyrics) return null;

    return (
        <div className={twMerge('lyrics-container', className)}>
            {visibleLines.map(({ line, isActive, isBefore, isAfter }) => (
                <LyricLine
                    key={line.id}
                    line={line}
                    isActive={isActive}
                    isBefore={isBefore}
                    isAfter={isAfter}
                    onWordClick={handleWordClick}
                />
            ))}
        </div>
    );
}; 