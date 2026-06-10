#!/usr/bin/env node
/**
 * sa2kit 3.x：legacy subpath → common/* / business/*
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = join(import.meta.dirname, '..');
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.d.ts']);

/** 长路径优先 */
const REPLACEMENTS = [
  ['sa2kit/mikuContest/ui/web', 'sa2kit/business/mikuContest/ui/web'],
  ['sa2kit/testYourself/admin', 'sa2kit/business/testYourself/admin'],
  ['sa2kit/testYourself/server', 'sa2kit/business/testYourself/server'],
  ['sa2kit/vocaloidBooth/server', 'sa2kit/business/vocaloidBooth/server'],
  ['sa2kit/vocaloidBooth/web', 'sa2kit/business/vocaloidBooth/web'],
  ['sa2kit/festivalCard/server', 'sa2kit/business/festivalCard/server'],
  ['sa2kit/festivalCard/routes', 'sa2kit/business/festivalCard/routes'],
  ['sa2kit/calendar/routes', 'sa2kit/business/calendar/routes'],
  ['sa2kit/calendar/server', 'sa2kit/business/calendar/server'],
  ['sa2kit/qqbot/ui/web', 'sa2kit/business/qqbot/ui/web'],
  ['sa2kit/qqbot/server', 'sa2kit/business/qqbot/server'],
  ['sa2kit/mmd/admin', 'sa2kit/business/mmd/admin'],
  ['sa2kit/mmd/server', 'sa2kit/business/mmd/server'],
  ['sa2kit/mmd/fx', 'sa2kit/business/mmd/fx'],
  ['sa2kit/universalExport/client', 'sa2kit/common/universalExport/client'],
  ['sa2kit/universalExport/server', 'sa2kit/common/universalExport/server'],
  ['sa2kit/universalExport', 'sa2kit/common/universalExport'],
  ['sa2kit/universalFile/server', 'sa2kit/common/universalFile/server'],
  ['sa2kit/universalFile/client', 'sa2kit/common/universalFile/client'],
  ['sa2kit/universalFile', 'sa2kit/common/universalFile'],
  ['sa2kit/mikuFusionGame', 'sa2kit/business/mikuFusionGame'],
  ['sa2kit/mikuFireworks3D', 'sa2kit/business/mikuFireworks3D'],
  ['sa2kit/testYourself', 'sa2kit/business/testYourself'],
  ['sa2kit/screenReceiver', 'sa2kit/business/screenReceiver'],
  ['sa2kit/vocaloidBooth', 'sa2kit/business/vocaloidBooth'],
  ['sa2kit/festivalCard', 'sa2kit/business/festivalCard'],
  ['sa2kit/navigation', 'sa2kit/business/navigation'],
  ['sa2kit/portfolio', 'sa2kit/business/portfolio'],
  ['sa2kit/calendar', 'sa2kit/business/calendar'],
  ['sa2kit/components', 'sa2kit/common/components'],
  ['sa2kit/imageCrop', 'sa2kit/common/imageCrop'],
  ['sa2kit/analytics', 'sa2kit/common/analytics'],
  ['sa2kit/config', 'sa2kit/common/config'],
  ['sa2kit/storage', 'sa2kit/common/storage'],
  ['sa2kit/request', 'sa2kit/common/request'],
  ['sa2kit/logger', 'sa2kit/common/logger'],
  ['sa2kit/utils', 'sa2kit/common/utils'],
  ['sa2kit/i18n', 'sa2kit/common/i18n'],
  ['sa2kit/ossFile', 'sa2kit/common/ossFile'],
  ['sa2kit/audioDetection', 'sa2kit/business/audioDetection'],
  ['sa2kit/bubbleShooter', 'sa2kit/business/bubbleShooter'],
  ['sa2kit/mmd', 'sa2kit/business/mmd'],
  ['sa2kit/ai/llm/ui/web', 'sa2kit/common/ai/llm/ui/web'],
  ['sa2kit/ai/llm/ui/miniapp', 'sa2kit/common/ai/llm/ui/miniapp'],
  ['sa2kit/ai/llm/ui/rn', 'sa2kit/common/ai/llm/ui/rn'],
  ['sa2kit/ai/llm/ui/electron', 'sa2kit/common/ai/llm/ui/electron'],
  ['sa2kit/ai/llm/core', 'sa2kit/common/ai/llm/core'],
  ['sa2kit/ai/llm/web', 'sa2kit/common/ai/llm/web'],
  ['sa2kit/ai/llm/miniapp', 'sa2kit/common/ai/llm/miniapp'],
  ['sa2kit/ai/llm/rn', 'sa2kit/common/ai/llm/rn'],
  ['sa2kit/ai/llm/electron', 'sa2kit/common/ai/llm/electron'],
  ['sa2kit/ai/llm', 'sa2kit/common/ai/llm'],
  ['@qhr123/sa2kit/components', '@qhr123/sa2kit/common/components'],
  ['@qhr123/sa2kit/mmd', '@qhr123/sa2kit/business/mmd'],
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === '.git') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (EXTS.has(extname(name))) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of walk(join(root, 'src'))
  .concat(walk(join(root, 'scripts')))
  .concat(walk(join(root, 'docs')))) {
  let text = readFileSync(file, 'utf8');
  let next = text;
  for (const [from, to] of REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  if (next !== text) {
    writeFileSync(file, next, 'utf8');
    changed += 1;
  }
}

console.log(`✓ updated ${changed} files`);
