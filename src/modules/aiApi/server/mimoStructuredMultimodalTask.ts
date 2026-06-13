import {
  CORE_STRUCTURED_MULTIMODAL_TASK_ID,
  assertValidMultimodalMedia,
  buildMultimodalMessages,
  detectVisionMessageFormat,
  extractJsonObject,
  registerAiTask,
  requireAiConnectionConfig,
  requestJson,
  splitMediaByKind,
  type AiTaskDefinition,
  type StructuredMultimodalInput,
} from 'sa2kit/common/aiApi/server';
import {
  isMimoApiBaseUrl,
  isMimoVisionCapableModel,
} from '../utils/mimoVisionModels';

function joinChatCompletionsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
}

function assertProfileVisionModel(modelId: string, hasImages: boolean, baseUrl: string) {
  if (!hasImages) return;
  const model = modelId.trim();
  if (!model) {
    throw new Error('识图需要选择视觉模型，请在 AI 设置或 ai.visionModel 中配置');
  }
  if (isMimoApiBaseUrl(baseUrl)) {
    if (!isMimoVisionCapableModel(model)) {
      throw new Error(
        `模型「${model}」不支持 MiMo 识图。请使用 mimo-v2.5 或 mimo-v2-omni，勿用 mimo-v2.5-pro。`
      );
    }
  }
}

function isStructuredMultimodalInput(input: unknown): input is StructuredMultimodalInput {
  if (!input || typeof input !== 'object') return false;
  const value = input as StructuredMultimodalInput;
  return typeof value.systemPrompt === 'string' && typeof value.userPrompt === 'string';
}

/** 覆盖 sa2kit 默认任务：允许 MiMo 视觉模型通过校验 */
export const mimoAwareStructuredMultimodalTask: AiTaskDefinition<
  StructuredMultimodalInput,
  { json: Record<string, unknown>; rawText: string }
> = {
  id: CORE_STRUCTURED_MULTIMODAL_TASK_ID,
  description: '结构化多模态（含 MiMo 识图兼容）',
  validateInput(input) {
    if (!isStructuredMultimodalInput(input)) {
      throw new Error('systemPrompt 与 userPrompt 为必填');
    }
    const config = requireAiConnectionConfig(input.connection);
    assertValidMultimodalMedia(input.media, {
      maxImageBytes: config.maxImageBytes,
      maxAudioBytes: config.maxAudioBytes,
    });
    return input;
  },
  async execute(input, ctx) {
    const config = requireAiConnectionConfig(input.connection, ctx.clientSettings);
    const media = assertValidMultimodalMedia(input.media, {
      maxImageBytes: config.maxImageBytes,
      maxAudioBytes: config.maxAudioBytes,
    });
    const { images } = splitMediaByKind(media);
    const hasImages = images.length > 0;
    const model = input.model || (hasImages ? config.visionModel : config.textModel);

    assertProfileVisionModel(model, hasImages, config.baseUrl);

    const schemaHint = input.jsonSchemaHint
      ? `\n\n请严格输出 JSON 对象，结构参考：\n${input.jsonSchemaHint}`
      : '\n\n请严格输出 JSON 对象，不要包含 Markdown 代码块。';

    const format = detectVisionMessageFormat(config.baseUrl);
    const messages = buildMultimodalMessages({
      systemPrompt: input.systemPrompt,
      userPrompt: `${input.userPrompt}${schemaHint}`,
      images,
      nativeAudios: [],
      format,
    });

    const payload: Record<string, unknown> = {
      model,
      messages,
      temperature: input.temperature ?? 0.2,
    };
    if (input.maxTokens !== undefined) payload.max_tokens = input.maxTokens;
    payload.response_format = { type: 'json_object' };

    const raw = await requestJson({
      url: joinChatCompletionsUrl(config.baseUrl),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: payload,
      timeoutMs: config.timeoutMs,
    });

    const content = (raw as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]
      ?.message?.content;
    const text = typeof content === 'string' ? content : '';
    const json = extractJsonObject(text);

    return {
      data: { json, rawText: text },
      meta: {
        model: (raw as { model?: string }).model ?? model,
        provider: 'openai-compatible',
      },
    };
  },
};

export function registerProfileAiTasks() {
  registerAiTask(mimoAwareStructuredMultimodalTask);
}
