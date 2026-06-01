import { getAiServerConfig } from './config';
import type { AiImageInput } from '../types';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function assertValidImageInput(image: AiImageInput): void {
  if (!image.base64?.trim()) {
    throw new Error('图片数据不能为空');
  }
  if (!ALLOWED_MIME.has(image.mimeType)) {
    throw new Error(`不支持的图片格式: ${image.mimeType}`);
  }

  const config = getAiServerConfig();
  const maxBytes = config?.maxImageBytes ?? 5 * 1024 * 1024;
  const byteLength = Buffer.byteLength(image.base64, 'base64');
  if (byteLength > maxBytes) {
    throw new Error(`图片过大，最大 ${Math.round(maxBytes / 1024 / 1024)}MB`);
  }
}

export async function fileToAiImageInput(file: File): Promise<AiImageInput> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return { base64, mimeType: file.type || 'image/jpeg' };
}
