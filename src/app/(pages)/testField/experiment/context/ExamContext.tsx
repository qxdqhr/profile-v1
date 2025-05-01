"use client";

import React, { 
  createContext, 
  useState, 
  useContext, 
  useEffect, 
  useCallback 
} from "react";
import { 
  Question,
  UserAnswer, 
  QuestionType, 
  MultipleChoiceQuestion,
  FillBlankQuestion,
  SingleChoiceQuestion
} from "../types";

interface ExamContextType {
  questions: Question[];
  currentQuestionIndex: number;
  currentQuestion: Question;
  userAnswers: UserAnswer[];
  questionsAnswered: string[];
  totalQuestions: number;
  examSubmitted: boolean;
  isMobile: boolean;
  
  // 导航方法
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  goToQuestion: (index: number) => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  
  // 回答问题方法
  handleSingleChoiceAnswer: (questionId: string, optionId: string) => void;
  handleMultipleChoiceAnswer: (questionId: string, optionId: string, isSelected: boolean) => void;
  handleTextAnswer: (questionId: string, text: string) => void;
  isOptionSelected: (optionId: string) => boolean;
  
  // 提交和重置考试
  handleSubmitExam: () => void;
  resetExam: () => void;
  
  // 计算得分
  calculateScore: () => {
    score: number;
    totalPoints: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unanswered: number;
  };
}

// 创建上下文
const ExamContext = createContext<ExamContextType | undefined>(undefined);

// 提供者组件
interface ExamProviderProps {
  children: React.ReactNode;
  initialQuestions: Question[];
}

export const ExamProvider: React.FC<ExamProviderProps> = ({ 
  children, 
  initialQuestions 
}) => {
  const [questions] = useState<Question[]>(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // 检测是否为移动设备
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // 当前问题
  const currentQuestion = questions[currentQuestionIndex];
  
  // 已回答的问题ID列表
  const questionsAnswered = userAnswers.map(answer => answer.questionId);
  
  // 导航方法
  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  }, [currentQuestionIndex, questions.length]);
  
  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  }, [currentQuestionIndex]);
  
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  }, [questions.length]);
  
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  // 回答问题的方法
  const handleSingleChoiceAnswer = useCallback((questionId: string, optionId: string) => {
    setUserAnswers(prevAnswers => {
      // 检查是否已经有这个问题的答案
      const existingAnswerIndex = prevAnswers.findIndex(
        answer => answer.questionId === questionId
      );
      
      if (existingAnswerIndex !== -1) {
        // 更新现有答案
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = {
          ...updatedAnswers[existingAnswerIndex],
          selectedOptions: [optionId]
        };
        return updatedAnswers;
      } else {
        // 添加新答案
        return [...prevAnswers, {
          questionId,
          selectedOptions: [optionId]
        }];
      }
    });
  }, []);
  
  const handleMultipleChoiceAnswer = useCallback((
    questionId: string, 
    optionId: string, 
    isSelected: boolean
  ) => {
    setUserAnswers(prevAnswers => {
      // 检查是否已经有这个问题的答案
      const existingAnswerIndex = prevAnswers.findIndex(
        answer => answer.questionId === questionId
      );
      
      if (existingAnswerIndex !== -1) {
        // 获取现有答案
        const existingAnswer = prevAnswers[existingAnswerIndex];
        let updatedOptions: string[];
        
        if (isSelected) {
          // 添加选项
          updatedOptions = [...existingAnswer.selectedOptions, optionId];
        } else {
          // 移除选项
          updatedOptions = existingAnswer.selectedOptions.filter(id => id !== optionId);
        }
        
        // 更新答案数组
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = {
          ...existingAnswer,
          selectedOptions: updatedOptions
        };
        
        return updatedAnswers;
      } else {
        // 添加新答案
        return [...prevAnswers, {
          questionId,
          selectedOptions: isSelected ? [optionId] : []
        }];
      }
    });
  }, []);
  
  const handleTextAnswer = useCallback((questionId: string, text: string) => {
    setUserAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(
        answer => answer.questionId === questionId
      );
      
      if (existingAnswerIndex !== -1) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = {
          ...updatedAnswers[existingAnswerIndex],
          textAnswer: text,
          selectedOptions: [] // 文本类型答案没有选项
        };
        return updatedAnswers;
      } else {
        return [...prevAnswers, {
          questionId,
          selectedOptions: [],
          textAnswer: text
        }];
      }
    });
  }, []);
  
  const isOptionSelected = useCallback((optionId: string) => {
    const currentQuestionAnswer = userAnswers.find(
      answer => answer.questionId === currentQuestion.id
    );
    
    return currentQuestionAnswer 
      ? currentQuestionAnswer.selectedOptions.includes(optionId)
      : false;
  }, [currentQuestion.id, userAnswers]);
  
  // 提交考试
  const handleSubmitExam = useCallback(() => {
    setExamSubmitted(true);
  }, []);
  
  // 重置考试
  const resetExam = useCallback(() => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setExamSubmitted(false);
  }, []);
  
  // 计算得分
  const calculateScore = useCallback(() => {
    let score = 0;
    let totalPoints = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    
    // questions.forEach(question => {
    //   totalPoints += question.points;
      
    //   const userAnswer = userAnswers.find(answer => answer.questionId === question.id);
      
    //   if (!userAnswer || userAnswer.selectedOptions.length === 0) {
    //     unansweredCount++;
    //     return;
    //   }
      
    //   const isCorrect = question.type === QuestionType.SingleChoice
    //     ? question.correctAnswers[0] === userAnswer.selectedOptions[0]
    //     : question.correctAnswers.length === userAnswer.selectedOptions.length &&
    //       question.correctAnswers.every(option => userAnswer.selectedOptions.includes(option));
      
    //   if (isCorrect) {
    //     score += question.points;
    //     correctCount++;
    //   } else {
    //     incorrectCount++;
    //   }
    // });
    questions.forEach(question => {
      totalPoints += question.score;
      
      const userAnswer = userAnswers.find(answer => answer.questionId === question.id);
      
      if (!userAnswer || userAnswer.selectedOptions.length === 0) {
        unansweredCount++;
        return;
      }

      let isCorrect = false;
      
      switch (question.type) {
        case QuestionType.SingleChoice:
          isCorrect = (question as SingleChoiceQuestion).answer === userAnswer.selectedOptions[0];
          break;
          
        case QuestionType.MultipleChoice:
          const multiQuestion = question as MultipleChoiceQuestion;
          isCorrect = (multiQuestion.answers.length === userAnswer.selectedOptions.length) &&
            multiQuestion.answers.every(answer => userAnswer.selectedOptions.includes(answer));
          break;
          
        case QuestionType.FillBlank:
          const fillQuestion = question as FillBlankQuestion;
          isCorrect = fillQuestion.answers.every((answer, index) => 
            userAnswer.textAnswer?.split(',')[index]?.trim() === answer
          );
          break;
          
        case QuestionType.ShortAnswer:
        case QuestionType.Essay:
          // 简答题和论述题需要人工评分,这里暂时跳过
          unansweredCount++;
          return;
      }
      
      if (isCorrect) {
        score += question.score;
        correctCount++;
      } else {
        incorrectCount++;
      }
    });
    
    return {
      score: isNaN(score) ? 0 : score,
      totalPoints: isNaN(totalPoints) ? 1 : totalPoints,
      correctAnswers: isNaN(correctCount) ? 0 : correctCount,
      incorrectAnswers: isNaN(incorrectCount) ? 0 : incorrectCount,
      unanswered: isNaN(unansweredCount) ? 0 : unansweredCount
    };
  }, [questions, userAnswers]);
  
  const value: ExamContextType = {
    questions,
    currentQuestionIndex,
    currentQuestion,
    userAnswers,
    questionsAnswered,
    totalQuestions: questions.length,
    examSubmitted,
    isMobile,
    
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    isFirstQuestion,
    isLastQuestion,
    
    handleSingleChoiceAnswer,
    handleMultipleChoiceAnswer,
    handleTextAnswer,
    isOptionSelected,
    
    handleSubmitExam,
    resetExam,
    calculateScore
  };
  
  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
};

// 使用上下文的Hook
export const useExam = () => {
  const context = useContext(ExamContext);
  
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  
  return context;
};
