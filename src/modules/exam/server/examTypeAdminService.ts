import { createExamTypeAdminService } from '@sa2kit/exam/server';
import {
  countExamQuestions,
  createExamTypeWithMetadata,
  deleteExamTypeCascade,
  findExamMetadata,
  findExamType,
  listExamTypes,
  updateExamTypeMetadata,
} from './examRepository';

const adminService = createExamTypeAdminService({
  listExamTypes,
  findExamType,
  findExamMetadata,
  countExamQuestions,
  createExamTypeWithMetadata,
  updateExamTypeMetadata,
  deleteExamTypeCascade,
});

export const listExamTypeIds = adminService.listExamTypeIds;
export const listExamTypeDetails = adminService.listExamTypeDetails;
export const createExamType = adminService.createExamType;
export const deleteExamType = adminService.deleteExamType;
export const updateExamType = adminService.updateExamType;
