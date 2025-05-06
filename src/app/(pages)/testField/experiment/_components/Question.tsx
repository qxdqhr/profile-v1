"use client";

import { useExam } from '../_context';
import { QuestionType } from '../_types';
import QuestionContent from './QuestionContent';
import OptionsList from './OptionsList';
import QuestionHeader from './QuestionHeader';

// 这个组件根据题目类型渲染不同的题目组件
const Question = () => {
  const { currentQuestion } = useExam();
  
  return (
    <div>
      <QuestionHeader />
      <QuestionContent question={currentQuestion} />
      
      {/* 根据题目类型渲染不同的答题区域 */}
      {(currentQuestion.type === QuestionType.SingleChoice || 
        currentQuestion.type === QuestionType.MultipleChoice) && (
        <OptionsList />
      )}
      
      {/* 在这里可以添加其他题型的渲染组件，如填空题、简答题等 */}
      {/* 比如: */}
      {/*
      {currentQuestion.type === QuestionType.FillBlank && (
        <FillBlankAnswerArea />
      )}
      
      {currentQuestion.type === QuestionType.ShortAnswer && (
        <ShortAnswerArea />
      )}
      */}
    </div>
  );
};

export default Question; 