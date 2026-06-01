import type { AiClientSettings } from '../utils/aiSettingsCore';

/** 统一 AI 任务请求 */
export interface AiApiRunRequest<TInput = unknown> {
  taskId: string;
  input: TInput;
  options?: AiTaskRunOptions;
  clientSettings?: AiClientSettings;
}

export interface AiTaskRunOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/** 统一 AI 任务响应 */
export interface AiApiResponse<TData = unknown> {
  success: boolean;
  taskId: string;
  data?: TData;
  error?: AiApiErrorBody;
  meta?: AiApiResponseMeta;
}

export interface AiApiErrorBody {
  code: AiApiErrorCode;
  message: string;
  details?: unknown;
}

export type AiApiErrorCode =
  | 'UNAUTHORIZED'
  | 'INVALID_INPUT'
  | 'TASK_NOT_FOUND'
  | 'AI_CONFIG_MISSING'
  | 'AI_REQUEST_FAILED'
  | 'AI_PARSE_FAILED'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA';

export interface AiApiResponseMeta {
  model: string;
  latencyMs: number;
  provider?: string;
  confidence?: number;
  rawSummary?: string;
}

/** 多模态图片输入（base64） */
export interface AiImageInput {
  base64: string;
  mimeType: string;
}

/** 通用结构化多模态任务输入 */
export interface StructuredMultimodalInput {
  systemPrompt: string;
  userPrompt: string;
  images?: AiImageInput[];
  jsonSchemaHint?: string;
  temperature?: number;
  maxTokens?: number;
}

/** 通用结构化多模态任务输出 */
export interface StructuredMultimodalOutput {
  json: Record<string, unknown>;
  rawText: string;
}

export interface AiTaskContext {
  userId: number;
  requestId: string;
  clientSettings?: AiClientSettings;
}

export interface AiTaskDefinition<TInput = unknown, TOutput = unknown> {
  id: string;
  description?: string;
  validateInput: (input: unknown) => TInput;
  execute: (input: TInput, ctx: AiTaskContext) => Promise<{
    data: TOutput;
    meta?: Partial<AiApiResponseMeta>;
  }>;
}
