"use client";

import { useState, useEffect } from 'react';
import { mockExamData } from './mockData';
import { Question, QuestionType, UserAnswer } from './types';
import './styles.css';

export default function ExamPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600); // 默认60分钟
  const [isMobile, setIsMobile] = useState(false);
  const [showQuestionList, setShowQuestionList] = useState(false);
  
  const currentQuestion = mockExamData.questions[currentQuestionIndex];
  
  // 检测设备类型
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          alert('考试时间已结束！');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // 格式化剩余时间
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // 处理单选题答案
  const handleSingleChoiceAnswer = (questionId: string, optionId: string) => {
    const updatedAnswers = [...userAnswers];
    const existingAnswerIndex = updatedAnswers.findIndex(
      (a) => a.questionId === questionId
    );
    
    if (existingAnswerIndex !== -1) {
      updatedAnswers[existingAnswerIndex] = {
        questionId,
        answer: optionId,
      };
    } else {
      updatedAnswers.push({
        questionId,
        answer: optionId,
      });
    }
    
    setUserAnswers(updatedAnswers);
  };
  
  // 处理多选题答案
  const handleMultipleChoiceAnswer = (
    questionId: string,
    optionId: string,
    checked: boolean
  ) => {
    const updatedAnswers = [...userAnswers];
    const existingAnswerIndex = updatedAnswers.findIndex(
      (a) => a.questionId === questionId
    );
    
    if (existingAnswerIndex !== -1) {
      const currentAnswer = updatedAnswers[existingAnswerIndex].answer as string[];
      
      if (checked) {
        updatedAnswers[existingAnswerIndex] = {
          questionId,
          answer: [...currentAnswer, optionId],
        };
      } else {
        updatedAnswers[existingAnswerIndex] = {
          questionId,
          answer: currentAnswer.filter((id) => id !== optionId),
        };
      }
    } else {
      updatedAnswers.push({
        questionId,
        answer: checked ? [optionId] : [],
      });
    }
    
    setUserAnswers(updatedAnswers);
  };
  
  // 获取当前问题的用户答案
  const getCurrentQuestionAnswer = (): string | string[] => {
    const answer = userAnswers.find(
      (a) => a.questionId === currentQuestion.id
    )?.answer;
    
    if (currentQuestion.type === QuestionType.MultipleChoice) {
      return answer as string[] || [];
    }
    
    return answer as string || "";
  };
  
  // 检查选项是否被选中
  const isOptionSelected = (optionId: string): boolean => {
    const answer = getCurrentQuestionAnswer();
    
    if (Array.isArray(answer)) {
      return answer.includes(optionId);
    }
    
    return answer === optionId;
  };
  
  // 检查题目是否已回答
  const isQuestionAnswered = (questionId: string): boolean => {
    return userAnswers.some((a) => a.questionId === questionId);
  };
  
  // 获取已回答题目数量
  const getAnsweredCount = () => {
    return userAnswers.length;
  };
  
  // 渲染题目内容
  const renderQuestionContent = (question: Question) => {
    return (
      <div className="question-container">
        <div className="question-text">
          {currentQuestionIndex + 1}. {question.content}
        </div>
        
        {question.imageUrl && (
          <div>
            <img 
              src={question.imageUrl} 
              alt="题目图片" 
              className="question-image"
              style={{ maxHeight: isMobile ? '150px' : '200px' }}
            />
          </div>
        )}
      </div>
    );
  };
  
  // 渲染选项
  const renderOptions = () => {
    if (
      currentQuestion.type !== QuestionType.SingleChoice &&
      currentQuestion.type !== QuestionType.MultipleChoice
    ) {
      return null;
    }
    
    return (
      <div className="options-container">
        {currentQuestion.options.map((option) => {
          const isSelected = isOptionSelected(option.id);
          
          return (
            <div 
              key={option.id} 
              className={`option-item ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                if (currentQuestion.type === QuestionType.SingleChoice) {
                  handleSingleChoiceAnswer(currentQuestion.id, option.id);
                } else if (currentQuestion.type === QuestionType.MultipleChoice) {
                  handleMultipleChoiceAnswer(
                    currentQuestion.id,
                    option.id,
                    !isSelected
                  );
                }
              }}
            >
              <div className="option-content">
                <div className="radio-container">
                  {currentQuestion.type === QuestionType.SingleChoice ? (
                    <div className={`radio-circle ${isSelected ? 'selected' : ''}`}>
                      {isSelected && (
                        <div className="radio-inner" />
                      )}
                    </div>
                  ) : (
                    <div className={`checkbox ${isSelected ? 'selected' : ''}`}>
                      {isSelected && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="white"
                          className="w-3 h-3"
                          style={{ width: '12px', height: '12px' }}
                        >
                          <path
                            fillRule="evenodd"
                            d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="option-text">
                  <div>{option.content}</div>
                  
                  {option.imageUrl && (
                    <div>
                      <img 
                        src={option.imageUrl} 
                        alt="选项图片" 
                        className="option-image"
                        style={{ maxHeight: isMobile ? '80px' : '100px' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // 显示题目类型标签
  const renderQuestionTypeTag = () => {
    let typeText = "";
    let tagClass = "";
    
    switch (currentQuestion.type) {
      case QuestionType.SingleChoice:
        typeText = "单选题";
        tagClass = "tag-single";
        break;
      case QuestionType.MultipleChoice:
        typeText = "多选题";
        tagClass = "tag-multiple";
        break;
      default:
        return null;
    }
    
    return (
      <span className={`tag ${tagClass}`}>
        {typeText}
      </span>
    );
  };
  
  // 题目列表
  const renderQuestionList = () => {
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
            {mockExamData.questions.map((question, index) => {
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
  
  // 导航按钮
  const renderNavigation = () => {
    const isPrevDisabled = currentQuestionIndex === 0;
    const isNextDisabled = currentQuestionIndex === mockExamData.questions.length - 1;
    
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
          <span className="question-nav-text">{currentQuestionIndex + 1} / {mockExamData.questions.length}</span>
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
  
  // 提交答案按钮
  const renderSubmitButton = () => {
    const isLastQuestion = currentQuestionIndex === mockExamData.questions.length - 1;
    
    if (!isLastQuestion) {
      return null;
    }
    
    return (
      <div className="submit-container">
        <button
          onClick={() => alert("答案已提交！")}
          className="submit-button"
        >
          提交答案
        </button>
      </div>
    );
  };
  
  // 状态栏
  const renderStatusBar = () => {
    return (
      <div className="status-bar">
        <div>
          <div className="status-text">
            已答: {getAnsweredCount()}/{mockExamData.questions.length}
          </div>
        </div>
        <div className="timer">
          剩余时间: {formatTime(timeLeft)}
        </div>
      </div>
    );
  };
  
  return (
    <div className="exam-container">
      <h1 className="exam-title">{mockExamData.title}</h1>
      
      {renderStatusBar()}
      {renderQuestionList()}
      
      <div className="exam-content">
        {/* 题目区域 */}
        <div className="question-header">
          <div className="score-text">
            得分：{currentQuestion.score}分
          </div>
          {renderQuestionTypeTag()}
        </div>
        
        {renderQuestionContent(currentQuestion)}
        
        {/* 答题区域 */}
        <div>
          {renderOptions()}
        </div>
        
        {/* 导航区域 */}
        {renderNavigation()}
        
        {/* 提交按钮 */}
        {renderSubmitButton()}
      </div>
      
      {/* 底部安全区域，特别是对全面屏手机 */}
      <div className="safe-area"></div>
    </div>
  );
}
//我现在正在制作一个考试的web端程序,目标准备在移动端上使用 目前 希望支持 选择题
//为保证扩展性,也要留有其他题类型的接口或枚举
//其中选择题需要支持图片显示
//并支持 单选 多选 题
//请先绘制一个答题页,数据可以先写死成一个json,划分好题目区域(支持图片显示或没有图片),答题区域(选项区域)