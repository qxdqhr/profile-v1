"use client";

import { useExam } from '../_context';
import { Question } from '@/app/(pages)/testField/(utility)/experiment/config/types';
import styles from '../styles.module.css';
import AudioPlayer from './AudioPlayer';

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
      
      {/* 显示题目音频播放器 */}
      {question.audioUrl && (
        <AudioPlayer 
          audioUrl={question.audioUrl}
          className={styles.questionAudioPlayer}
        />
      )}
      
      {/* 显示题目图片 */}
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