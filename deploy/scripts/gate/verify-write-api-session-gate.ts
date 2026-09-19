/**
 * 静态检查：OPT-02 优先写面必须在路由层校验真 session（禁止只靠 middleware cookie 存在性）。
 * 离线、无 DB。
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

const SESSION_MARK =
  /getApiSessionUser|requireApiSession|requireAdminSession|requireExampleAccess|requireOssExampleAdmin/;

/** 相对 app_web/web 的 route 文件：这些写面必须带 session 闸门符号 */
const GATED_WRITE_ROUTES = [
  'src/app/api/universal-file/files/route.ts',
  'src/app/api/universal-file/folders/route.ts',
  'src/app/api/universal-file/monitoring/route.ts',
  'src/app/api/universal-file/upload/route.ts',
  'src/app/api/universal-export/configs/route.ts',
  'src/app/api/universal-export/configs/[id]/route.ts',
  'src/app/api/universal-export/export/route.ts',
  'src/app/api/testField/(utility)/experiment/config/examTypes/route.ts',
  'src/app/api/testField/(utility)/experiment/config/questions/route.ts',
  'src/app/api/examples/qqbot/[...path]/route.ts',
  'src/app/api/examples/calendar/events/route.ts',
  'src/app/api/examples/oss/upload/route.ts',
] as const;

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function main() {
  const webRoot = join(root, 'app_web/web');
  for (const rel of GATED_WRITE_ROUTES) {
    const text = readFileSync(join(webRoot, rel), 'utf8');
    assert(SESSION_MARK.test(text), `missing session gate: ${rel}`);
  }
  console.log(`write-api session gate checks passed (${GATED_WRITE_ROUTES.length} routes)`);
}

main();
