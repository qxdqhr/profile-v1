"use client";

import { ExamProvider } from './context/ExamContext';
import ExamLayout from './components/ExamLayout';
import { mockQuestions } from './mockData';

// 使用客户端组件
export default function ExperimentPage() {
  return (
    <div>
      <ExamProvider initialQuestions={mockQuestions}>
        <ExamLayout />
      </ExamProvider>
    </div>
  );
}