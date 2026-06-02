/** 非对话类模型 ID 片段（embedding、语音等） */
const NON_CHAT_PATTERNS = [
  /embed/i,
  /whisper/i,
  /tts/i,
  /dall-e/i,
  /moderation/i,
  /realtime/i,
  /audio/i,
  /transcrib/i,
  /sora/i,
];

/** 常见支持视觉输入的模型 ID 特征 */
const VISION_HINT_PATTERNS = [
  /^gpt-4o/i,
  /^gpt-4-turbo/i,
  /^gpt-4-vision/i,
  /^gpt-4\.1/i,
  /claude-3/i,
  /gemini.*(pro|flash|vision)/i,
  /qwen.*vl/i,
  /vision/i,
  /-vl/i,
  /llava/i,
  /doubao.*vision/i,
  /glm-4v/i,
  /internvl/i,
  /pixtral/i,
  /deepseek-vl/i,
];

/** 自动选择视觉模型时的优先级（精确或前缀匹配） */
const PREFERRED_VISION_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-4-vision-preview',
  'gpt-4.1-mini',
  'gpt-4.1',
  'claude-3-5-sonnet-latest',
  'claude-3-5-haiku-latest',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'qwen-vl-max',
  'qwen2-vl-72b-instruct',
];

function isChatModel(id: string): boolean {
  return !NON_CHAT_PATTERNS.some((pattern) => pattern.test(id));
}

export function isLikelyVisionModel(id: string): boolean {
  return VISION_HINT_PATTERNS.some((pattern) => pattern.test(id));
}

export function filterChatModels(modelIds: string[]): string[] {
  return modelIds.filter(isChatModel).sort((a, b) => a.localeCompare(b));
}

export function filterVisionModels(modelIds: string[]): string[] {
  const chat = filterChatModels(modelIds);
  const vision = chat.filter(isLikelyVisionModel);
  return vision.length > 0 ? vision : chat;
}

function matchesPreferred(modelId: string, preferred: string): boolean {
  return modelId === preferred || modelId.startsWith(`${preferred}-`);
}

/** 从可用模型中挑选默认视觉模型 */
export function pickDefaultVisionModel(
  modelIds: string[],
  current?: string
): string | undefined {
  const visionModels = filterVisionModels(modelIds);
  if (visionModels.length === 0) return undefined;

  const trimmedCurrent = current?.trim();
  if (trimmedCurrent && visionModels.includes(trimmedCurrent)) {
    return trimmedCurrent;
  }

  for (const preferred of PREFERRED_VISION_MODELS) {
    const match = visionModels.find((id) => matchesPreferred(id, preferred));
    if (match) return match;
  }

  return visionModels[0];
}
