import { listLessonsFromPaths } from './lessonIndex';

export type WorkspaceValidationResult = {
  ok: boolean;
  warnings: string[];
  errors: string[];
  lessonCount: number;
  hasMission: boolean;
};

const SKIP_ZIP_PREFIXES = ['__MACOSX/', '.DS_Store', 'node_modules/'];

export function shouldSkipZipEntry(relativePath: string): boolean {
  const normalized = relativePath.replaceAll('\\', '/');
  if (!normalized || normalized.endsWith('/')) return true;
  return SKIP_ZIP_PREFIXES.some(
    (prefix) => normalized.startsWith(prefix) || normalized.includes(`/${prefix}`),
  );
}

export function validateWorkspacePaths(paths: string[]): WorkspaceValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const normalized = paths.map((p) => p.replaceAll('\\', '/'));

  const hasMission = normalized.includes('MISSION.md');
  const lessons = listLessonsFromPaths(normalized);

  if (!hasMission && lessons.length === 0) {
    errors.push('工作区至少需要 MISSION.md 或 lessons/ 下的课时文件');
  }
  if (!hasMission) {
    warnings.push('缺少 MISSION.md，建议补充学习动机');
  }
  if (lessons.length === 0) {
    warnings.push('尚无 lessons/ 课时，可通过导入或 Agent 生成');
  }

  const orders = lessons.map((l) => l.order);
  const uniqueOrders = new Set(orders);
  if (uniqueOrders.size !== orders.length) {
    errors.push('lessons/ 中存在重复课时编号');
  }

  return {
    ok: errors.length === 0,
    warnings,
    errors,
    lessonCount: lessons.length,
    hasMission,
  };
}
