#!/usr/bin/env node
/**
 * profile-v1 将 sa2kit / sa2kit-ui 以 git submodule + workspace 引用。
 * 两库 dist 不进 git；sa2kit common 发 d.ts，business 跳过声明。
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const reactStyle = join(root, 'packages/sa2kit-ui/packages/react/dist/style.css');
const sa2kitDts = join(root, 'packages/sa2kit/dist/common/auth/server/index.d.ts');
/** 代表性 business 产物：旧域 mmd + Phase H1 样板 ideaList（避免只建了旧 dist 就跳过） */
const sa2kitBusinessMarkers = [
  join(root, 'packages/sa2kit/dist/business/mmd/index.js'),
  join(root, 'packages/sa2kit/dist/business/ideaList/index.js'),
  join(root, 'packages/sa2kit/dist/business/filetransfer/index.js'),
  join(root, 'packages/sa2kit/dist/business/ticketMonitor/index.js'),
  join(root, 'packages/sa2kit/dist/business/fitnessPlan/index.js'),
  join(root, 'packages/sa2kit/dist/business/comfyPrompt/index.js'),
  join(root, 'packages/sa2kit/dist/business/skillManager/index.js'),
  join(root, 'packages/sa2kit/dist/business/cardMaker/index.js'),
  join(root, 'packages/sa2kit/dist/business/webTools/qrCode/index.js'),
  join(root, 'packages/sa2kit/dist/business/webTools/dateCalculator/index.js'),
  join(root, 'packages/sa2kit/dist/business/webTools/workCalculate/index.js'),
  join(root, 'packages/sa2kit/dist/business/webTools/imageDownloader/index.js'),
  join(root, 'packages/sa2kit/dist/business/vocaloidBooth/routes/index.js'),
  join(root, 'packages/sa2kit/dist/business/mmd/routes/index.js'),
  join(root, 'packages/sa2kit/dist/business/solarSystem/index.js'),
];

function run(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const needUi = !existsSync(reactStyle);
const needSa2kit =
  !existsSync(sa2kitDts) || sa2kitBusinessMarkers.some((p) => !existsSync(p));

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
