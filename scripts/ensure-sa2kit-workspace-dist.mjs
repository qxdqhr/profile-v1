#!/usr/bin/env node
/**
 * profile-v1 将 sa2kit / sa2kit-ui 以 git submodule + workspace 引用。
 * 两库 dist 不进 git，本地 / CI / Docker 需在 install 后补齐产物。
 *
 * - @sa2kit-ui/react：组件与 style.css
 * - sa2kit：须含 business（宿主实验田大量引用）；设 SA2KIT_WITH_BUSINESS=1 全量构建
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const reactStyle = join(root, 'packages/sa2kit-ui/packages/react/dist/style.css');
const sa2kitBusiness = join(root, 'packages/sa2kit/dist/business/mmd/index.js');

function run(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const needUi = !existsSync(reactStyle);
const needSa2kit = !existsSync(sa2kitBusiness);

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
  console.log('[ensure-sa2kit-workspace-dist] building sa2kit (common + business, skip DTS)…');
  run('pnpm', ['--filter', 'sa2kit', 'run', 'build'], {
    SA2KIT_WITH_BUSINESS: '1',
    SA2KIT_SKIP_DTS: '1',
  });
}

console.log('[ensure-sa2kit-workspace-dist] done');
