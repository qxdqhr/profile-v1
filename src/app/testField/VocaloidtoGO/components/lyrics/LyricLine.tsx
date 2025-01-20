import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { LyricLine as LyricLineType, Word } from '../../types';
import { useGameStore } from '../../store';

interface LyricLineProps {
    line: LyricLineType;
    isActive: boolean;
    isBefore: boolean;
    isAfter: boolean;
    onWordClick?: (word: Word) => void;
    className?: string;
}

export const LyricLine: React.FC<LyricLineProps> = ({
    line,
    isActive,
    isBefore,
    isAfter,
    onWordClick,
    className
}) => {
    const [hoveredWord, setHoveredWord] = useState<Word | null>(null);
    const { settings } = useGameStore();

    const getWordClassName = (word: Word) => {
        return twMerge(
            'lyrics-word',
            word.isKeyword && 'lyrics-word-highlight',
            hoveredWord?.id === word.id && 'lyrics-word-active'
        );
    };

    return (
        <div
            className={twMerge(
                'lyrics-line',
                isActive && 'lyrics-line-active',
                isBefore && 'lyrics-line-before',
                isAfter && 'lyrics-line-after',
                className
            )}
        >
            <div className="lyrics-text">
                {line.words.map((word, index) => (
                    <span
                        key={word.id}
                        className={getWordClassName(word)}
                        onClick={() => onWordClick?.(word)}
                        onMouseEnter={() => setHoveredWord(word)}
                        onMouseLeave={() => setHoveredWord(null)}
                    >
                        {word.text}
                    </span>
                ))}
            </div>
            
            {settings.showReading && (
                <div className="lyrics-reading">
                    {line.reading}
                </div>
            )}
            
            {settings.showTranslation && (
                <div className="lyrics-translation">
                    {line.translation}
                </div>
            )}

            {hoveredWord && (
                <div className="lyrics-tooltip">
                    <div className="lyrics-tooltip-reading">
                        {hoveredWord.reading}
                    </div>
                    <div className="lyrics-tooltip-meaning">
                        {hoveredWord.meaning}
                    </div>
                    <div className="lyrics-tooltip-level">
                        JLPT {hoveredWord.level}
                    </div>
                </div>
            )}
        </div>
    );
}; 