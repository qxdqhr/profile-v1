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

export const examRepository = services.repository;
export const examQueryService = services.queryService;
export const examAdminService = services.adminService;
