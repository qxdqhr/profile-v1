import { createAiTaskRunner } from '@/modules/aiApi';
import { fileToAiImageInput } from 'sa2kit/common/aiApi';
import {
  CALENDAR_AI_TASK_IDS,
  type CalendarEventFromImageInput,
  type CalendarEventFromImageOutput,
} from '../ai/eventFromImageTask.types';

export const analyzeCalendarEventFromImage = createAiTaskRunner<
  CalendarEventFromImageInput,
  CalendarEventFromImageOutput
>(CALENDAR_AI_TASK_IDS.eventFromImage);

/** 将上传图片转为识图任务输入 */
export async function buildCalendarImageInput(
  file: File
): Promise<Pick<CalendarEventFromImageInput, 'imageBase64' | 'mimeType'>> {
  const image = await fileToAiImageInput(file);
  return { imageBase64: image.base64, mimeType: image.mimeType };
}

export type { CalendarEventFromImageInput, CalendarEventFromImageOutput };
