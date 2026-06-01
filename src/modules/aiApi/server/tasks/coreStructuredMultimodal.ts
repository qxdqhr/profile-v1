import type {
  AiTaskDefinition,
  StructuredMultimodalInput,
  StructuredMultimodalOutput,
} from '../types';
import { callOpenAiCompatibleVisionChat } from '../openaiVisionClient';
import { extractJsonObject } from '../jsonUtils';
import { assertValidImageInput } from '../imageUtils';

function isStructuredMultimodalInput(input: unknown): input is StructuredMultimodalInput {
  if (!input || typeof input !== 'object') return false;
  const value = input as StructuredMultimodalInput;
  return typeof value.systemPrompt === 'string' && typeof value.userPrompt === 'string';
}

export const coreStructuredMultimodalTask: AiTaskDefinition<
  StructuredMultimodalInput,
  StructuredMultimodalOutput
> = {
  id: 'core.structuredMultimodal',
  description: '通用结构化多模态任务：文本 + 可选图片 → JSON',
  validateInput(input) {
    if (!isStructuredMultimodalInput(input)) {
      throw new Error('systemPrompt 与 userPrompt 为必填');
    }
    for (const image of input.images ?? []) {
      assertValidImageInput(image);
    }
    return input;
  },
  async execute(input) {
    const schemaHint = input.jsonSchemaHint
      ? `\n\n请严格输出 JSON 对象，结构参考：\n${input.jsonSchemaHint}`
      : '\n\n请严格输出 JSON 对象，不要包含 Markdown 代码块。';

    const result = await callOpenAiCompatibleVisionChat({
      systemPrompt: input.systemPrompt,
      userPrompt: `${input.userPrompt}${schemaHint}`,
      images: input.images,
      temperature: input.temperature ?? 0.2,
      maxTokens: input.maxTokens,
      jsonMode: true,
    });

    const json = extractJsonObject(result.content);

    return {
      data: {
        json,
        rawText: result.content,
      },
      meta: {
        model: result.model,
        provider: 'openai-compatible',
      },
    };
  },
};
