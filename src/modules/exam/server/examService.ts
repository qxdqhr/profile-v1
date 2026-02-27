import { createExamQueryService } from '@sa2kit/exam/server';
import {
  getAllExamTypes,
  getExamMetadata,
  getExamQuestions,
  getFullExamConfig,
  saveFullExamConfig,
} from '@/db/services/exam-service';

const queryService = createExamQueryService({
  getAllExamTypes,
  getExamMetadata,
  getExamQuestions,
  getFullExamConfig,
  saveFullExamConfig,
});

export const fetchExamTypes = queryService.fetchExamTypes;
export const fetchExamMetadata = queryService.fetchExamMetadata;
export const fetchExamQuestions = queryService.fetchExamQuestions;
export const fetchFullExamConfig = queryService.fetchFullExamConfig;
export const saveExamConfig = queryService.saveExamConfig;
