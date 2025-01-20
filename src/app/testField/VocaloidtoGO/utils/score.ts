import { Word } from '../types';

/**
 * 计算单词得分
 */
export function calculateWordScore(word: Word, combo: number): number {
    // 基础分数
    let baseScore = 100;

    // 根据难度调整分数
    const difficultyMultiplier = {
        N5: 1.0,
        N4: 1.2,
        N3: 1.5,
        N2: 1.8,
        N1: 2.0
    };

    // 关键词加分
    const keywordMultiplier = word.isKeyword ? 1.5 : 1.0;

    // 连击加成（每10连击增加10%，最高100%）
    const comboMultiplier = 1 + Math.min(Math.floor(combo / 10) * 0.1, 1.0);

    return Math.round(
        baseScore * 
        difficultyMultiplier[word.level] * 
        keywordMultiplier * 
        comboMultiplier
    );
}

/**
 * 计算准确率
 */
export function calculateAccuracy(correctWords: Word[], wrongWords: Word[]): number {
    const total = correctWords.length + wrongWords.length;
    if (total === 0) return 0;
    return Math.round((correctWords.length / total) * 100);
}

/**
 * 计算最终得分
 */
export function calculateFinalScore(
    correctWords: Word[],
    wrongWords: Word[],
    maxCombo: number,
    timeSpent: number,
    difficulty: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
): number {
    // 基础分数：正确单词得分总和
    const baseScore = correctWords.reduce((sum, word) => sum + calculateWordScore(word, 0), 0);

    // 准确率加成
    const accuracy = calculateAccuracy(correctWords, wrongWords);
    const accuracyMultiplier = accuracy / 100;

    // 连击加成
    const comboMultiplier = 1 + Math.min(maxCombo / 100, 0.5);

    // 时间效率加成（每分钟学习10个单词为基准）
    const timeEfficiency = (correctWords.length / (timeSpent / 60)) / 10;
    const timeMultiplier = Math.min(Math.max(timeEfficiency, 0.5), 1.5);

    // 难度加成
    const difficultyMultiplier = {
        N5: 1.0,
        N4: 1.2,
        N3: 1.5,
        N2: 1.8,
        N1: 2.0
    }[difficulty];

    return Math.round(
        baseScore *
        accuracyMultiplier *
        comboMultiplier *
        timeMultiplier *
        difficultyMultiplier
    );
} 