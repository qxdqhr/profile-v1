"use client";

import { useExam } from '../context/ExamContext';

const Navigation = () => {
  const { 
    currentQuestionIndex, 
    setCurrentQuestionIndex, 
    examData, 
    setShowQuestionList 
  } = useExam();
  
  const isPrevDisabled = currentQuestionIndex === 0;
  const isNextDisabled = currentQuestionIndex === examData.questions.length - 1;
  
  return (
    <div className="navigation">
      <button
        onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
        disabled={isPrevDisabled}
        className={`nav-button prev-button ${isPrevDisabled ? 'disabled' : ''}`}
      >
        上一题
      </button>
      
      <button 
        onClick={() => setShowQuestionList(true)}
        className="question-select"
      >
        <span className="question-nav-text">{currentQuestionIndex + 1} / {examData.questions.length}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="question-nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <button
        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
        disabled={isNextDisabled}
        className={`nav-button next-button ${isNextDisabled ? 'disabled' : ''}`}
      >
        下一题
      </button>
    </div>
  );
};

export default Navigation; 