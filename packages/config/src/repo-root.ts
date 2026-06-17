import { existsSync } from 'node:fs';
import path from 'node:path';

/** 向上查找含 pnpm-workspace.yaml 的 monorepo 根（供 apps/web 内 cwd 仍为子目录时使用） */
export function findMonorepoRoot(startDir = process.cwd()): string {
  let dir = startDir;
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return startDir;
}

export function getMonorepoConfigDir(): string {
  return path.join(findMonorepoRoot(), 'config');
}
