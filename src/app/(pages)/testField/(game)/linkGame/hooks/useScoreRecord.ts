import { useState, useEffect } from 'react';
import { ScoreRecord, GameType } from '../types';

const SCORE_STORAGE_KEY = 'linkGame_scores';
const MAX_RECORDS = 10;

export const useScoreRecord = () => {
  const [scoreRecords, setScoreRecords] = useState<ScoreRecord[]>([]);

  // 加载得分记录
  useEffect(() => {
    const savedScores = localStorage.getItem(SCORE_STORAGE_KEY);
    if (savedScores) {
      setScoreRecords(JSON.parse(savedScores));
    }
  }, []);

  // 添加新的得分记录
  const addScoreRecord = (
    score: number,
    gameType: GameType,
    gridWidth: number,
    gridHeight: number,
    duration: number
  ) => {
    const newRecord: ScoreRecord = {
      score,
      date: new Date().toLocaleString(),
      gameType,
      gridSize: `${gridWidth}x${gridHeight}`,
      duration
    };

    const newRecords = [...scoreRecords, newRecord]
      .sort((a, b) => b.score - a.score) // 按分数降序排序
      .slice(0, MAX_RECORDS); // 只保留前10条记录

    setScoreRecords(newRecords);
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(newRecords));
  };

  // 清除所有记录
  const clearRecords = () => {
    setScoreRecords([]);
    localStorage.removeItem(SCORE_STORAGE_KEY);
  };

  return {
    scoreRecords,
    addScoreRecord,
    clearRecords
  };
}; 