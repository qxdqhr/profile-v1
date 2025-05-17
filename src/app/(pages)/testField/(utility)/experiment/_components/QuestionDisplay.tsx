"use client";

import { useExam } from '../_context';
import { QuestionType } from '@/app/(pages)/testField/config/experiment/types';
import styles from '../styles.module.css';

const QuestionDisplay = () => {
  const { currentQuestion, currentQuestionIndex, totalQuestions } = useExam();
  
  // 根据不同的题目类型显示不同的标签
  const renderQuestionTypeTag = () => {
    switch (currentQuestion.type) {
      case QuestionType.SingleChoice:
        return (
          <div className={styles["question-type"]}>单选题</div>
        );
      case QuestionType.MultipleChoice:
        return (
          <div className={styles["question-type"]}>多选题</div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles["question-container"]}>
      <div className={styles["question-header"]}>
        <div className={styles["question-number"]}>
          第 {currentQuestionIndex + 1}/{totalQuestions} 题
        </div>
        {renderQuestionTypeTag()}
      </div>

      <div className={styles["question-content"]}>
        {currentQuestion.content}
      </div>
      
      {currentQuestion.imageUrl && (
        <div>
          <img 
            src={currentQuestion.imageUrl} 
            alt="题目图片"
            className={styles["question-image"]}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay; 