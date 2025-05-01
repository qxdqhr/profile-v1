"use client";

import { useExam } from '../context/ExamContext';
import styles from '../styles.module.css';

const ExamResults = () => {
  const { 
    questions, 
    userAnswers, 
    resetExam,
    resetToStart,
    calculateScore
  } = useExam();
  
  const { score, totalPoints, correctAnswers, incorrectAnswers, unanswered } = calculateScore();
  
  // 计算百分比分数
  const percentageScore = Math.round((score / totalPoints) * 100);
  
  return (
    <div className={styles["exam-container"]}>
      <div className={styles["results-container"]}>
        <div className={styles["results-header"]}>
          <h1 className={styles["results-title"]}>考试完成</h1>
          <p>感谢您完成考试！以下是您的成绩。</p>
        </div>
        
        <div className={styles["score-container"]}>
          <div className={styles["score-circle"]}>
            <div className={styles["score-value"]}>{percentageScore}%</div>
            <div className={styles["score-label"]}>总分</div>
          </div>
        </div>
        
        <div className={styles["summary-stats"]}>
          <div className={styles["stat-item"]}>
            <div className={styles["stat-value"]}>{correctAnswers}</div>
            <div className={styles["stat-label"]}>正确</div>
          </div>
          
          <div className={styles["stat-item"]}>
            <div className={styles["stat-value"]}>{incorrectAnswers}</div>
            <div className={styles["stat-label"]}>错误</div>
          </div>
          
          <div className={styles["stat-item"]}>
            <div className={styles["stat-value"]}>{unanswered}</div>
            <div className={styles["stat-label"]}>未回答</div>
          </div>
        </div>
        
        <div className={styles["button-group"]}>
          <button 
            className={styles["review-button"]}
            onClick={resetExam}
          >
            重新开始考试
          </button>
          
          <button 
            className={`${styles["review-button"]} ${styles["secondary-button"]}`}
            onClick={resetToStart}
          >
            回到启动页
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResults; 