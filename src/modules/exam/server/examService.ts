import {
  getAllExamTypes,
  getExamMetadata,
  getExamQuestions,
  getFullExamConfig,
  saveFullExamConfig,
} from '@/db/services/exam-service';

export async function fetchExamTypes() {
  return getAllExamTypes();
}

export async function fetchExamMetadata(type: string) {
  return getExamMetadata(type);
}

export async function fetchExamQuestions(type: string) {
  return getExamQuestions(type);
}

export async function fetchFullExamConfig(type: string) {
  return getFullExamConfig(type);
}

export async function saveExamConfig(type: string, config: unknown) {
  return saveFullExamConfig(type, config);
}
