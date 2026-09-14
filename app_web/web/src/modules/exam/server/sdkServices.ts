/**
 * exam 宿主 DI 薄层（Phase G2 / H∞ 确认）：
 * 业务实现全在 `sa2kit/business/exam/server`；本文件只注入 profile `db` + schema。
 * **禁止**在此新增答题/配置业务逻辑；答卷 UI 仍在 `/testField/experiment`（未下沉）。
 */
import { createExamServices } from 'sa2kit/business/exam/server';
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
