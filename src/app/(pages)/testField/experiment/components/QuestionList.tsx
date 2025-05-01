"use client";

import { useExam } from '../context/ExamContext';

const QuestionList = () => {
  const { 
    showQuestionList, 
    setShowQuestionList, 
    examData, 
    currentQuestionIndex, 
    setCurrentQuestionIndex, 
    isQuestionAnswered 
  } = useExam();
  
  if (!showQuestionList) {
    return null;
  }
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">题目列表</h3>
          <button
            onClick={() => setShowQuestionList(false)}
            className="modal-close"
          >
            关闭
          </button>
        </div>
        
        <div className="question-grid">
          {examData.questions.map((question, index) => {
            const isAnswered = isQuestionAnswered(question.id);
            const isCurrent = index === currentQuestionIndex;
            let buttonClass = "question-button ";
            
            if (isCurrent) {
              buttonClass += "current";
            } else if (isAnswered) {
              buttonClass += "answered";
            } else {
              buttonClass += "unanswered";
            }
            
            return (
              <button
                key={question.id}
                className={buttonClass}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  setShowQuestionList(false);
                }}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color legend-unanswered"></div>
            <span>未答</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-answered"></div>
            <span>已答</span>
          </div>
          <div className="legend-item">
            <div className="legend-color legend-current"></div>
            <span>当前题</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionList; 