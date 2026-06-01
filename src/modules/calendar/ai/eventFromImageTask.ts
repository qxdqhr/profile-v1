import type { AiTaskDefinition } from '@/modules/aiApi/types';
import { assertValidImageInput } from '@/modules/aiApi/server/imageUtils';
import { callOpenAiCompatibleVisionChat } from '@/modules/aiApi/server/openaiVisionClient';
import { extractJsonObject } from '@/modules/aiApi/server/jsonUtils';
import {
  CALENDAR_AI_TASK_IDS,
  type CalendarEventFromImageInput,
  type CalendarEventFromImageOutput,
} from './eventFromImageTask.types';

export type { CalendarEventFromImageInput, CalendarEventFromImageOutput };
export { CALENDAR_AI_TASK_IDS };

function isCalendarEventFromImageInput(input: unknown): input is CalendarEventFromImageInput {
  if (!input || typeof input !== 'object') return false;
  const value = input as CalendarEventFromImageInput;
  return typeof value.imageBase64 === 'string' && typeof value.mimeType === 'string';
}

function parseOutput(json: Record<string, unknown>): CalendarEventFromImageOutput {
  const title = String(json.title ?? '').trim();
  const startTime = String(json.startTime ?? '').trim();
  const endTime = String(json.endTime ?? '').trim();

  if (!title) throw new Error('未能识别活动标题');
  if (!startTime || !endTime) throw new Error('未能识别活动时间，请手动填写');

  const confidenceRaw = Number(json.confidence);
  const confidence = Number.isFinite(confidenceRaw)
    ? Math.min(1, Math.max(0, confidenceRaw))
    : 0.5;

  return {
    title,
    description: json.description ? String(json.description) : undefined,
    startTime,
    endTime,
    allDay: Boolean(json.allDay),
    location: json.location ? String(json.location) : undefined,
    confidence,
    rawSummary: json.rawSummary ? String(json.rawSummary) : undefined,
  };
}

export const calendarEventFromImageTask: AiTaskDefinition<
  CalendarEventFromImageInput,
  CalendarEventFromImageOutput
> = {
  id: CALENDAR_AI_TASK_IDS.eventFromImage,
  description: '从图片识别日历活动信息',
  validateInput(input) {
    if (!isCalendarEventFromImageInput(input)) {
      throw new Error('imageBase64 与 mimeType 为必填');
    }
    assertValidImageInput({ base64: input.imageBase64, mimeType: input.mimeType });
    return input;
  },
  async execute(input, ctx) {
    const timezone = input.timezone || 'Asia/Shanghai';
    const locale = input.locale || 'zh-CN';
    const referenceDate = input.referenceDate || new Date().toISOString();

    const systemPrompt = [
      '你是日历活动信息提取助手。',
      '从用户提供的图片中识别会议、票务、海报、行程单等活动信息。',
      `时区: ${timezone}，语言: ${locale}，参考当前时间: ${referenceDate}。`,
      '必须输出单个 JSON 对象，字段：',
      'title(string), description?(string), startTime(ISO8601), endTime(ISO8601),',
      'allDay(boolean), location?(string), confidence(0-1 number), rawSummary?(string)。',
      '若无法确定精确时间，根据图片内容合理推断；全天活动 allDay=true。',
      '不要输出 Markdown。',
    ].join('\n');

    const result = await callOpenAiCompatibleVisionChat(
      {
        systemPrompt,
        userPrompt: '请识别图片中的活动并输出 JSON。',
        images: [{ base64: input.imageBase64, mimeType: input.mimeType }],
        jsonMode: true,
        temperature: 0.1,
      },
      ctx.clientSettings
    );

    const json = extractJsonObject(result.content);
    const data = parseOutput(json);

    return {
      data,
      meta: {
        model: result.model,
        provider: 'openai-compatible',
        confidence: data.confidence,
        rawSummary: data.rawSummary,
      },
    };
  },
};
