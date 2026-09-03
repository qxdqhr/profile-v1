#!/usr/bin/env node
/**
 * profile-v1 将 sa2kit / sa2kit-ui 以 git submodule + workspace 引用。
 * 两库 dist 不进 git；sa2kit common 发 d.ts，business 跳过声明。
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const reactStyle = join(root, 'packages/sa2kit-ui/packages/react/dist/style.css');
const sa2kitBusiness = join(root, 'packages/sa2kit/dist/business/mmd/index.js');
const sa2kitDts = join(root, 'packages/sa2kit/dist/common/auth/server/index.d.ts');

function run(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const needUi = !existsSync(reactStyle);
const needSa2kit = !existsSync(sa2kitBusiness) || !existsSync(sa2kitDts);

if (!needUi && !needSa2kit) {
  console.log('[ensure-sa2kit-workspace-dist] OK — dist already present');
  process.exit(0);
}

if (needUi) {
  console.log('[ensure-sa2kit-workspace-dist] building @sa2kit-ui/shared + @sa2kit-ui/react…');
  run('pnpm', ['--filter', '@sa2kit-ui/shared', 'build']);
  run('pnpm', ['--filter', '@sa2kit-ui/react', 'build']);
}

if (needSa2kit) {
  console.log('[ensure-sa2kit-workspace-dist] building sa2kit (common d.ts + business js)…');
  run('pnpm', ['--filter', 'sa2kit', 'run', 'build'], {
    SA2KIT_WITH_BUSINESS: '1',
    SA2KIT_SKIP_DTS: '0',
    SA2KIT_SKIP_PREPARE: '1',
  });
}

console.log('[ensure-sa2kit-workspace-dist] done');
