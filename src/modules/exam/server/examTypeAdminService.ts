import { examAdminService, examRepository } from './sdkServices';

export const listExamTypeIds = examAdminService.listExamTypeIds;
export const listExamTypeDetails = examAdminService.listExamTypeDetails;
export const createExamType = examAdminService.createExamType;
export const deleteExamType = examAdminService.deleteExamType;
export const updateExamType = examAdminService.updateExamType;

export const findExamType = examRepository.findExamType;
