import { createExamServices } from '@sa2kit/exam/server';
import { db } from '@/db';
import {
  examMetadata,
  examQuestions,
  examResultModals,
  examStartScreens,
  examTypes,
} from '@/db/schema';

const services = createExamServices({
  db,
  schema: {
    examTypes,
    examMetadata,
    examQuestions,
    examStartScreens,
    examResultModals,
  },
});

export const fetchExamTypes = services.queryService.fetchExamTypes;
export const fetchExamMetadata = services.queryService.fetchExamMetadata;
export const fetchExamQuestions = services.queryService.fetchExamQuestions;
export const fetchFullExamConfig = services.queryService.fetchFullExamConfig;
export const saveExamConfig = services.queryService.saveExamConfig;

export const listExamTypeIds = services.adminService.listExamTypeIds;
export const listExamTypeDetails = services.adminService.listExamTypeDetails;
export const createExamType = services.adminService.createExamType;
export const deleteExamType = services.adminService.deleteExamType;
export const updateExamType = services.adminService.updateExamType;

export const findExamType = services.repository.findExamType;
