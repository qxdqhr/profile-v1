/** 小米 MiMo 多模态模型（识图）；排除 -pro 纯文本型号 */
const MIMO_VISION_MODEL = /^mimo-v2(?:\.5|-omni|-flash)(?:-asr)?$/i;

export function isMimoVisionCapableModel(modelId: string): boolean {
  const trimmed = modelId.trim();
  if (!trimmed) return false;
  if (/-pro$/i.test(trimmed)) return false;
  return MIMO_VISION_MODEL.test(trimmed);
}

export function isMimoApiBaseUrl(baseUrl: string): boolean {
  return baseUrl.toLowerCase().includes('xiaomimimo.com');
}
