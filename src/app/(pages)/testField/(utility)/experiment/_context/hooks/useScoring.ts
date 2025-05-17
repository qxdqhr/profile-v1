import { useCallback } from 'react';
import { 
  Question, 
  UserAnswer, 
  QuestionType, 
  SingleChoiceQuestion, 
  MultipleChoiceQuestion, 
  FillBlankQuestion 
} from '@/app/(pages)/testField/config/experiment/types';

export const useScoring = (questions: Question[], userAnswers: UserAnswer[]) => {
  // 计算得分
  const calculateScore = useCallback(() => {
    let score = 0;
    let totalPoints = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    
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
  
  return { calculateScore };
}; 