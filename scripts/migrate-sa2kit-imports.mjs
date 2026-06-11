#!/usr/bin/env node
/**
 * sa2kit 3.2.0：将 3.1 扁平 subpath 迁移为 common/* + business/* 命名空间。
 * 长路径优先匹配。
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = join(import.meta.dirname, '..');
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.d.ts', '.mjs']);

/** [old, new] — 长路径优先 */
const REPLACEMENTS = [
  // business — deep paths first
  ['sa2kit/business/mikuContest/ui/web', 'sa2kit/business/mikuContest/ui/web'],
  ['sa2kit/business/testYourself/admin', 'sa2kit/business/testYourself/admin'],
  ['sa2kit/business/testYourself/server', 'sa2kit/business/testYourself/server'],
  ['sa2kit/business/vocaloidBooth/server', 'sa2kit/business/vocaloidBooth/server'],
  ['sa2kit/business/vocaloidBooth/web', 'sa2kit/business/vocaloidBooth/web'],
  ['sa2kit/business/festivalCard/server', 'sa2kit/business/festivalCard/server'],
  ['sa2kit/business/festivalCard/routes', 'sa2kit/business/festivalCard/routes'],
  ['sa2kit/business/calendar/routes', 'sa2kit/business/calendar/routes'],
  ['sa2kit/business/calendar/server', 'sa2kit/business/calendar/server'],
  ['sa2kit/business/qqbot/ui/web', 'sa2kit/business/qqbot/ui/web'],
  ['sa2kit/business/qqbot/server', 'sa2kit/business/qqbot/server'],
  ['sa2kit/business/mmd/admin', 'sa2kit/business/mmd/admin'],
  ['sa2kit/business/mmd/server', 'sa2kit/business/mmd/server'],
  ['sa2kit/business/mmd', 'sa2kit/business/mmd'],
  ['sa2kit/business/music/server', 'sa2kit/business/music/server'],
  ['sa2kit/business/mikuFusionGame', 'sa2kit/business/mikuFusionGame'],
  ['sa2kit/business/mikuFireworks3D', 'sa2kit/business/mikuFireworks3D'],
  ['sa2kit/business/testYourself', 'sa2kit/business/testYourself'],
  ['sa2kit/business/screenReceiver', 'sa2kit/business/screenReceiver'],
  ['sa2kit/business/vocaloidBooth', 'sa2kit/business/vocaloidBooth'],
  ['sa2kit/business/festivalCard', 'sa2kit/business/festivalCard'],
  ['sa2kit/business/audioDetection', 'sa2kit/business/audioDetection'],
  ['sa2kit/business/navigation', 'sa2kit/business/navigation'],
  ['sa2kit/business/portfolio', 'sa2kit/business/portfolio'],
  ['sa2kit/business/calendar', 'sa2kit/business/calendar'],
  ['sa2kit/business/music', 'sa2kit/business/music'],
  ['sa2kit/business/mmd', 'sa2kit/business/mmd'],

  // common — deep paths first
  ['sa2kit/common/universalExport/client', 'sa2kit/common/universalExport/client'],
  ['sa2kit/common/universalExport/server', 'sa2kit/common/universalExport/server'],
  ['sa2kit/common/universalExport', 'sa2kit/common/universalExport'],
  ['sa2kit/common/file/server', 'sa2kit/common/file/server'],
  ['sa2kit/common/file/client', 'sa2kit/common/file/client'],
  ['sa2kit/common/file', 'sa2kit/common/file'],
  ['sa2kit/common/ai/llm/ui/web', 'sa2kit/common/ai/llm/ui/web'],
  ['sa2kit/common/ai/llm/ui/miniapp', 'sa2kit/common/ai/llm/ui/miniapp'],
  ['sa2kit/common/ai/llm/ui/rn', 'sa2kit/common/ai/llm/ui/rn'],
  ['sa2kit/common/ai/llm/ui/electron', 'sa2kit/common/ai/llm/ui/electron'],
  ['sa2kit/common/ai/llm/core', 'sa2kit/common/ai/llm/core'],
  ['sa2kit/common/ai/llm/web', 'sa2kit/common/ai/llm/web'],
  ['sa2kit/common/ai/llm/miniapp', 'sa2kit/common/ai/llm/miniapp'],
  ['sa2kit/common/ai/llm/rn', 'sa2kit/common/ai/llm/rn'],
  ['sa2kit/common/ai/llm/electron', 'sa2kit/common/ai/llm/electron'],
  ['sa2kit/common/ai/llm', 'sa2kit/common/ai/llm'],
  ['sa2kit/common/analytics/server', 'sa2kit/common/analytics/server'],
  ['sa2kit/common/analytics', 'sa2kit/common/analytics'],
  ['sa2kit/common/file/server', 'sa2kit/common/file/server'],
  ['sa2kit/common/file/client', 'sa2kit/common/file/client'],
  ['sa2kit/common/file', 'sa2kit/common/file'],
  ['sa2kit/common/config/server', 'sa2kit/common/config/server'],
  ['sa2kit/common/config', 'sa2kit/common/config'],
  ['sa2kit/common/components', 'sa2kit/common/components'],
  ['sa2kit/common/imageCrop', 'sa2kit/common/imageCrop'],
  ['sa2kit/common/logger', 'sa2kit/common/logger'],
  ['sa2kit/common/storage', 'sa2kit/common/storage'],
  ['sa2kit/common/request', 'sa2kit/common/request'],
  ['sa2kit/common/i18n', 'sa2kit/common/i18n'],
  ['sa2kit/common/utils', 'sa2kit/common/utils'],
  ['sa2kit/common/api', 'sa2kit/common/api'],
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
  .concat(walk(join(root, 'scripts')))) {
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
