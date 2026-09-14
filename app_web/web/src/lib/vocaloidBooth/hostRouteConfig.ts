import { db } from '@/db';
import type { VocaloidBoothRouteConfig } from 'sa2kit/business/vocaloidBooth/routes';

export async function resolveVocaloidBoothFileAccessUrl(objectKey: string, origin: string) {
  const res = await fetch(`${origin}/api/universal-file/${encodeURIComponent(objectKey)}`);
  const data = await res.json();
  return data?.data?.accessUrl ?? '';
}

export function createVocaloidBoothHostRouteConfig(): VocaloidBoothRouteConfig {
  return {
    db,
    resolveFileAccessUrl: resolveVocaloidBoothFileAccessUrl,
  };
}
