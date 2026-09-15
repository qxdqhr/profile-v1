/**
 * OPT-04：禁止 @profile/db → @profile/auth（方向必须是 auth 读 db schema）。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dbRoot = join(root, 'host/db');

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function walkTsFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkTsFiles(full, out);
    else if (name.endsWith('.ts')) out.push(full);
  }
  return out;
}

function main() {
  const pkg = JSON.parse(readFileSync(join(dbRoot, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  assert(!deps['@profile/auth'], '@profile/db must not depend on @profile/auth');

  const authImport = /from\s+['"]@profile\/auth(?:\/[^'"]*)?['"]|require\(\s*['"]@profile\/auth/;
  for (const file of walkTsFiles(join(dbRoot, 'src'))) {
    const text = readFileSync(file, 'utf8');
    assert(!authImport.test(text), `forbidden auth import in ${file}`);
  }

  console.log('db↛auth dependency checks passed');
}

main();
