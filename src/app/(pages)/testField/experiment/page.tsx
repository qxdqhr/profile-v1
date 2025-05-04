"use client";

import { useState, useEffect } from 'react';
import { ExamProvider } from './context';
import ExamLayout from './components/ExamLayout';
import { mockQuestions, mockStartScreenData, mockResultModalData } from './mockData';
import { loadConfigurations } from '../config/utils/configStorage';
import { Question, StartScreenData, ResultModalData } from './types';
import styles from './styles.module.css';

// 使用客户端组件
export default function ExperimentPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [startScreenData, setStartScreenData] = useState<StartScreenData>(mockStartScreenData);
  const [resultModalData, setResultModalData] = useState<ResultModalData>(mockResultModalData);

  // 加载配置数据
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await loadConfigurations();
        setQuestions(config.questions);
        setStartScreenData(config.startScreen);
        setResultModalData(config.resultModal);
      } catch (error) {
        console.error('加载配置失败:', error);
        // 加载失败时使用默认模拟数据
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  if (isLoading) {
    return (
      <div className={styles["start-container"]}>
        <div className={styles["start-content"] + " " + styles.visible}>
          <h1 className={styles["start-title"]}>加载考试数据中...</h1>
          <p className={styles["start-description"]}>请稍候，我们正在准备您的考试内容。</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ExamProvider 
        initialQuestions={questions}
        startScreenData={startScreenData}
        resultModalData={resultModalData}
      >
        <ExamLayout />
      </ExamProvider>
    </div>
  );
}