// 题目类型枚举
export enum QuestionType {
  SingleChoice = "SINGLE_CHOICE",
  MultipleChoice = "MULTIPLE_CHOICE",
  FillBlank = "FILL_BLANK",
  ShortAnswer = "SHORT_ANSWER",
  Essay = "ESSAY"
}

// 基础题目接口
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  content: string;
  imageUrl?: string;
  score: number;
}

// 选择题选项
export interface Option {
  id: string;
  content: string;
  imageUrl?: string;
}

// 单选题
export interface SingleChoiceQuestion extends BaseQuestion {
  type: QuestionType.SingleChoice;
  options: Option[];
  answer: string; // 正确选项的id
}

// 多选题
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: QuestionType.MultipleChoice;
  options: Option[];
  answers: string[]; // 正确选项的id数组
}

// 填空题
export interface FillBlankQuestion extends BaseQuestion {
  type: QuestionType.FillBlank;
  answers: string[];
}

// 简答题
export interface ShortAnswerQuestion extends BaseQuestion {
  type: QuestionType.ShortAnswer;
  answer: string;
}

// 论述题
export interface EssayQuestion extends BaseQuestion {
  type: QuestionType.Essay;
  answer: string;
}

// 题目类型联合
export type Question = 
  | SingleChoiceQuestion 
  | MultipleChoiceQuestion 
  | FillBlankQuestion 
  | ShortAnswerQuestion 
  | EssayQuestion;

// 答题页数据结构
export interface ExamData {
  title: string;
  questions: Question[];
}

// 用户答案类型
export type UserAnswer = {
  questionId: string;
  answer: string | string[];
}; 