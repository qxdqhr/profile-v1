import { ExamData, QuestionType } from './types';

export const mockExamData: ExamData = {
  title: "示例考试",
  questions: [
    {
      id: "q1",
      type: QuestionType.SingleChoice,
      content: "以下哪个是中国的首都？",
      score: 10,
      options: [
        { id: "q1_o1", content: "上海" },
        { id: "q1_o2", content: "北京" },
        { id: "q1_o3", content: "广州" },
        { id: "q1_o4", content: "深圳" },
      ],
      answer: "q1_o2"
    },
    {
      id: "q2",
      type: QuestionType.MultipleChoice,
      content: "以下哪些是JavaScript框架或库？",
      score: 15,
      options: [
        { id: "q2_o1", content: "React" },
        { id: "q2_o2", content: "Vue" },
        { id: "q2_o3", content: "Python" },
        { id: "q2_o4", content: "Angular" },
      ],
      answers: ["q2_o1", "q2_o2", "q2_o4"]
    },
    {
      id: "q3",
      type: QuestionType.SingleChoice,
      content: "下图中显示的是哪种编程语言的logo？",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png",
      score: 10,
      options: [
        { id: "q3_o1", content: "Angular" },
        { id: "q3_o2", content: "React" },
        { id: "q3_o3", content: "Vue" },
        { id: "q3_o4", content: "Svelte" },
      ],
      answer: "q3_o2"
    },
    {
      id: "q4",
      type: QuestionType.MultipleChoice,
      content: "以下哪些是常见的CSS预处理器？",
      score: 10,
      options: [
        { id: "q4_o1", content: "Sass" },
        { id: "q4_o2", content: "Less" },
        { id: "q4_o3", content: "jQuery" },
        { id: "q4_o4", content: "Stylus" },
      ],
      answers: ["q4_o1", "q4_o2", "q4_o4"]
    }
  ]
}; 