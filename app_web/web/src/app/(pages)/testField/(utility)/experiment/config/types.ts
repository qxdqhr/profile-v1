import type {
  Question,
  StartScreenData,
  ResultModalData,
  ModalPopEffect,
  TextShakeEffect,
  TextFlashEffect,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  Option,
  SpecialEffect,
  UserAnswer,
  FillBlankQuestion,
  ShortAnswerQuestion,
  EssayQuestion,
} from 'sa2kit/business/exam/ui/web';
import {
  QuestionType,
  SpecialEffectType,
} from 'sa2kit/business/exam/ui/web';

/** 配置台本地 ConfigData（答卷类型已迁 sa2kit） */
export interface ConfigData {
  questions: Question[];
  startScreen: StartScreenData;
  resultModal: ResultModalData;
}

export type {
  Question,
  StartScreenData,
  ResultModalData,
  ModalPopEffect,
  TextShakeEffect,
  TextFlashEffect,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  Option,
  SpecialEffect,
  UserAnswer,
  FillBlankQuestion,
  ShortAnswerQuestion,
  EssayQuestion,
};

export const EXAM_TYPE_MAP: Record<string, string> = {
  default: 'default',
  arknights: 'arknights',
};

export { QuestionType, SpecialEffectType };
