import { 
  Question, 
  StartScreenData, 
  ResultModalData,
  QuestionType,
  SpecialEffectType,
  ModalPopEffect,
  TextShakeEffect,
  TextFlashEffect
} from '../_types';

// 配置数据接口
export interface ConfigData {
  questions: Question[];
  startScreen: StartScreenData;
  resultModal: ResultModalData;
}

// 为配置组件导出所需类型
export type { 
  Question,
  StartScreenData, 
  ResultModalData,
  ModalPopEffect,
  TextShakeEffect,
  TextFlashEffect
};

// 导出类型枚举
export { QuestionType, SpecialEffectType }; 