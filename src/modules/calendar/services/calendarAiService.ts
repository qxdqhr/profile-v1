import { createAiTaskRunner } from '@/modules/aiApi';
import {
  CALENDAR_AI_TASK_IDS,
  type CalendarEventFromImageInput,
  type CalendarEventFromImageOutput,
} from '../ai/eventFromImageTask.types';

export const analyzeCalendarEventFromImage = createAiTaskRunner<
  CalendarEventFromImageInput,
  CalendarEventFromImageOutput
>(CALENDAR_AI_TASK_IDS.eventFromImage);

export async function fileToBase64Image(file: File): Promise<{ imageBase64: string; mimeType: string }> {
  const buffer = await file.arrayBuffer();
  const imageBase64 = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  return {
    imageBase64,
    mimeType: file.type || 'image/jpeg',
  };
}

export type { CalendarEventFromImageInput, CalendarEventFromImageOutput };
