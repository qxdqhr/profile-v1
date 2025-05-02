import { Question, QuestionType, SpecialEffectType } from './types';

// 创建模拟题目数据
export const mockQuestions: Question[] = [
  {
    id: '1',
    content: '地球是太阳系中距离太阳第几颗行星？',
    type: QuestionType.SingleChoice,
    options: [
      { id: '1a', content: '第二颗' },
      { id: '1b', content: '第三颗' },
      { id: '1c', content: '第四颗' },
      { id: '1d', content: '第五颗' },
    ],
    answer: '1c',
    score: 2,
  },
  {
    id: '2',
    content: '以下哪些是编程语言？',
    type: QuestionType.MultipleChoice,
    options: [
      { id: '2a', content: 'Java' },
      { id: '2b', content: 'Python' },
      { id: '2c', content: 'Excel' },
      { id: '2d', content: 'JavaScript' },
    ],
    answers: ['2a', '2b', '2d'],
    score: 3,
    specialEffect: {
      type: SpecialEffectType.ModalPop,
      title: '多选题提示',
      content: '注意：这是一道多选题，请选择所有正确的选项。Excel不是编程语言，它是一款电子表格软件。',
      buttonText: '我明白了'
    }
  },
  {
    id: '3',
    content: '下图中展示的是哪种动物？',
    imageUrl: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80',
    type: QuestionType.SingleChoice,
    options: [
      { id: '3a', content: '老虎' },
      { id: '3b', content: '狮子' },
      { id: '3c', content: '豹子' },
      { id: '3d', content: '狐狸' },
    ],
    answer: '3d',
    score: 2,
    specialEffect: {
      type: SpecialEffectType.TextShake
    }
  },
  {
    id: '4',
    content: '关于太阳系，以下哪些说法是正确的？',
    type: QuestionType.MultipleChoice,
    options: [
      { id: '4a', content: '太阳是太阳系中最大的天体' },
      { id: '4b', content: '地球是太阳系中最大的行星' },
      { id: '4c', content: '木星是太阳系中最大的行星' },
      { id: '4d', content: '月球是地球的卫星' },
    ],
    answers: ['4a', '4c', '4d'],
    score: 3,
    specialEffect: {
      type: SpecialEffectType.ModalPop,
      title: '多选题提示',
      content: '提示：太阳系中最大的行星是木星，而不是地球。地球是太阳系中第五大行星。',
      buttonText: '我明白了'
    }
  },
  {
    id: '5',
    content: '以下哪种花卉被称为中国十大名花之一？',
    type: QuestionType.SingleChoice,
    options: [
      { 
        id: '5a', 
        content: '玫瑰花',
        imageUrl: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      },
      { 
        id: '5b', 
        content: '牡丹花',
        imageUrl: 'https://images.unsplash.com/photo-1557968581-06958f0df4e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80'
      },
      { 
        id: '5c', 
        content: '郁金香',
        imageUrl: 'https://images.unsplash.com/photo-1487088678257-3a541e6e3922?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80'
      },
      { 
        id: '5d', 
        content: '向日葵',
        imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1635&q=80'
      },
    ],
    answer: '5b',
    score: 2,
    specialEffect: {
      type: SpecialEffectType.TextFlash
    }
  }
]; 