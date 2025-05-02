import exp from "constants";

// 题目类型枚举
export enum QuestionType {
  SingleChoice = 'single_choice',
  MultipleChoice = 'multiple_choice',
  FillBlank = 'fill_blank',
  ShortAnswer = 'short_answer',
  Essay = 'essay',
}

// 基础题目接口
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  content: string;
  imageUrl?: string;
  score: number;
  specialEffect?: SpecialEffect; 
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
export interface UserAnswer {
  questionId: string;
  selectedOptions: string[];
  textAnswer?: string;
} 

// 特效类型
export interface SpecialBaseEffect {
  type?: SpecialEffectType;
} 

// 题目类型联合
export type SpecialEffect = 
  | ModalPopEffect 
  | TextShakeEffect 
  | TextFlashEffect;

// 特效类型枚举
export enum SpecialEffectType {
  //弹窗弹出
  ModalPop = 'modal_pop',
  // 答题界面所有文字抖动
  TextShake = 'text_shake',
  // 答题界面所有文字闪烁
  TextFlash = 'text_flash',
}

// 弹窗弹出特效
export interface ModalPopEffect extends SpecialBaseEffect {
  type: SpecialEffectType.ModalPop;
  title?: string; 
  content?: string;
  imageUrl?: string;
  buttonText?: string;
}

export interface TextShakeEffect extends SpecialBaseEffect {
  type: SpecialEffectType.TextShake;
}

export interface TextFlashEffect extends SpecialBaseEffect {
  type: SpecialEffectType.TextFlash;
}

