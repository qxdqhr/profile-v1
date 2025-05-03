"use client";

import { useExam } from '../context';
import { Question } from '../types';
import styles from '../styles.module.css';

interface QuestionContentProps {
  question: Question;
}

const QuestionContent = ({ question }: QuestionContentProps) => {
  const { currentQuestionIndex, isMobile } = useExam();
  
  return (
    <div className={styles["question-container"]}>
      <div className={styles["question-text"]}>
        {currentQuestionIndex + 1}. {question.content}
      </div>
      
      {question.imageUrl && (
        <div>
          <img 
            src={question.imageUrl} 
            alt="题目图片" 
            className={styles["question-image"]}
            style={{ maxHeight: isMobile ? '150px' : '200px' }}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionContent; 