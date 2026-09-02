"use client";

import { useExam } from '../_context';
import { QuestionType } from '@/app/(pages)/testField/(utility)/experiment/config/types';
import QuestionContent from './QuestionContent';
import OptionsList from './OptionsList';
import QuestionHeader from './QuestionHeader';
import FillBlankAnswerArea from './FillBlankAnswerArea';

// 这个组件根据题目类型渲染不同的题目组件
const Question = () => {
  const { currentQuestion } = useExam();
  
  return (
    <div>
      <QuestionHeader />
      <QuestionContent question={currentQuestion} />
      
      {/* 根据题目类型渲染不同的答题区域 */}
      {(currentQuestion.type === QuestionType.SingleChoice ||
        currentQuestion.type === QuestionType.MultipleChoice) && <OptionsList />}

      {currentQuestion.type === QuestionType.FillBlank && <FillBlankAnswerArea />}
    </div>
  );
};

export default Question; 