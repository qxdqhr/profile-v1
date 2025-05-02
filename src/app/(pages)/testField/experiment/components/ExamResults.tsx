"use client";

import { useEffect, useState } from 'react';
import { useExam } from '../context/ExamContext';
import styles from '../styles.module.css';

const ExamResults = () => {
  const [showModal, setShowModal] = useState(false);
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
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 5000); // 10秒后显示弹窗

    return () => clearTimeout(timer);
  }, []);

  function assert(condition: boolean, message: string): asserts condition {
    if (condition) {
        throw new Error(`${message}`);
    }
  }
  return (
    <div className={styles["exam-container"]}>
      {showModal && (
        <div className={styles["modal"]}>
          <div className={styles["modal-content"]}>
            <h2>考试结果分析完成</h2>
            {
              percentageScore > 60 && (
                <p>您已经查看了成绩报告 10 秒钟了，需要重新测试吗？</p>
              )
            }
            {
              percentageScore <= 60 && (
                <p>你果然还记得我们的过去,即使是新生文明,也无法逃脱即将毁灭的未来</p>
              )
            }
            <button onClick={() => {
              setShowModal(false)
              if (percentageScore <= 60) {
                assert(true, '让我们继续我们之前的理想吧');
              }
            }}>关闭</button>
          </div>
        </div>
      )}
      
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