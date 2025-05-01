"use client";

import { useExam } from '../context/ExamContext';
import styles from '../styles.module.css';

// 导入我们的组件
import QuestionDisplay from './QuestionDisplay';
import OptionsList from './OptionsList';
import NavigationControls from './NavigationControls';
import ProgressIndicator from './ProgressIndicator';
import ExamResults from './ExamResults';
import StartScreen from './StartScreen';

const ExamLayout = () => {
  const { examSubmitted, examStarted } = useExam();
  
  // 如果考试已提交，显示结果页面
  if (examSubmitted) {
    return <ExamResults />;
  }
  
  // 如果考试未开始，显示启动页面
  if (!examStarted) {
    return <StartScreen />;
  }
  
  // 否则显示考试内容
  return (
    <div className={styles["exam-container"]}>
      <div className={styles["exam-header"]}>
        <h1 className={styles["exam-title"]}>在线考试</h1>
        <p className={styles["exam-description"]}>
          请仔细阅读每道题目，并选择正确的答案。完成后点击提交按钮。
        </p>
      </div>
      
      <ProgressIndicator />
      
      <QuestionDisplay />
      
      <OptionsList />
      
      <NavigationControls />
    </div>
  );
};

export default ExamLayout; 