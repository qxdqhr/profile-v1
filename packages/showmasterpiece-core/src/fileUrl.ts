import type { FileUrlResolver } from 'sa2kit/common/file/server';
import { getProfileOssFileBootstrap } from './integrations/ossFile';

let defaultResolver: FileUrlResolver | null = null;

/**
 * 创建 ShowMasterpiece 专用 fileId → URL 解析器（显式依赖注入，无 globalThis）。
 */
export function createShowmasterpieceFileUrlResolver(): FileUrlResolver {
  return getProfileOssFileBootstrap().createFileUrlResolver();
}

/**
 * 进程内默认解析器（懒初始化单例，仅限 profile-v1 服务端 bootstrap）。
 */
export function getShowmasterpieceFileUrlResolver(): FileUrlResolver {
  defaultResolver ??= createShowmasterpieceFileUrlResolver();
  return defaultResolver;
}

export async function resolveShowmasterpieceFileUrl(
  fileId: string,
): Promise<string | null> {
  const url = await getShowmasterpieceFileUrlResolver()(fileId);
  return url ?? null;
}

export async function getShowMasterpieceFileConfig() {
  return getProfileOssFileBootstrap().getConfigManager();
}
