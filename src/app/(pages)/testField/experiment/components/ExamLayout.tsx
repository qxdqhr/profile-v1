"use client";

import { useExam } from '../context/ExamContext';
import styles from '../styles.module.css';

// 导入我们的组件
import QuestionDisplay from './QuestionDisplay';
import OptionsList from './OptionsList';
import NavigationControls from './NavigationControls';
import ProgressIndicator from './ProgressIndicator';
import ExamResults from './ExamResults';

const ExamLayout = () => {
  const { examSubmitted } = useExam();
  
  if (examSubmitted) {
    return <ExamResults />;
  }
  
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