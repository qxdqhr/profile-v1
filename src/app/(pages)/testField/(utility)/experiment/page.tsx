"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExamProvider } from './_context';
import ExamLayout from './_components/ExamLayout';
import { mockQuestions, mockStartScreenData, mockResultModalData } from './_utils/mockData';
import { loadConfigurations } from '@/app/(pages)/testField/config/experiment/_service/configManagement';
import { Question, StartScreenData, ResultModalData } from '@/app/(pages)/testField/config/experiment/types';
import styles from './styles.module.css';
import { EXAM_TYPE_MAP } from '@/app/(pages)/testField/config/experiment/types';

// 创建一个内部组件来使用 useSearchParams
function ExperimentContent() {
  const searchParams = useSearchParams();
  const examType = searchParams.get('type') || 'default';
  
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [startScreenData, setStartScreenData] = useState<StartScreenData>(mockStartScreenData);
  const [resultModalData, setResultModalData] = useState<ResultModalData>(mockResultModalData);
  const [error, setError] = useState<string | null>(null);

  // 加载配置数据
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 根据type参数决定加载哪个配置
        const examId = EXAM_TYPE_MAP[examType] || 'default';
        const config = await loadConfigurations(examId);
        
        setQuestions(config.questions);
        setStartScreenData(config.startScreen);
        setResultModalData(config.resultModal);
      } catch (error) {
        console.error('加载配置失败:', error);
        setError(`加载试卷类型 ${examType} 失败，请检查参数是否正确`);
        // 加载失败时使用默认模拟数据
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [examType]); // 当examType变化时重新加载

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
  
  if (error) {
    return (
      <div className={styles["start-container"]}>
        <div className={styles["start-content"] + " " + styles.visible}>
          <h1 className={styles["start-title"]}>出错了</h1>
          <p className={styles["start-description"]}>{error}</p>
          <p className={styles["start-description"]}>
            <a href="/testField" className={styles["start-button"]} style={{ display: 'inline-block', marginTop: '20px' }}>
              返回主页
            </a>
          </p>
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

// 主组件
export default function ExperimentPage() {
  return (
    <Suspense fallback={
      <div className={styles["start-container"]}>
        <div className={styles["start-content"] + " " + styles.visible}>
          <h1 className={styles["start-title"]}>加载中...</h1>
        </div>
      </div>
    }>
      <ExperimentContent />
    </Suspense>
  );
}