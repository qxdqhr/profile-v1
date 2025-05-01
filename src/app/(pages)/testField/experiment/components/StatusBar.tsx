"use client";

import { useExam } from '../context/ExamContext';
import styles from '../styles.module.css';

const StatusBar = () => {
  const { getAnsweredCount, examData, timeLeft, formatTime } = useExam();
  
  return (
    <div className={styles["status-bar"]}>
      <div>
        <div className={styles["status-text"]}>
          已答: {getAnsweredCount()}/{examData.questions.length}
        </div>
      </div>
      <div className={styles.timer}>
        剩余时间: {formatTime(timeLeft)}
      </div>
    </div>
  );
};

export default StatusBar; 