#!/usr/bin/env node
/**
 * sa2kit 3.x：将错误的 common/* / business/* 前缀还原为 package.json exports 实际路径。
 * 长路径优先匹配。
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = join(import.meta.dirname, '..');
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.d.ts', '.mjs']);

/** [wrong, correct] — 长路径优先 */
const REPLACEMENTS = [
  ['sa2kit/mikuContest/ui/web', 'sa2kit/mikuContest/ui/web'],
  ['sa2kit/testYourself/admin', 'sa2kit/testYourself/admin'],
  ['sa2kit/testYourself/server', 'sa2kit/testYourself/server'],
  ['sa2kit/vocaloidBooth/server', 'sa2kit/vocaloidBooth/server'],
  ['sa2kit/vocaloidBooth/web', 'sa2kit/vocaloidBooth/web'],
  ['sa2kit/festivalCard/server', 'sa2kit/festivalCard/server'],
  ['sa2kit/festivalCard/routes', 'sa2kit/festivalCard/routes'],
  ['sa2kit/calendar/routes', 'sa2kit/calendar/routes'],
  ['sa2kit/calendar/server', 'sa2kit/calendar/server'],
  ['sa2kit/qqbot/ui/web', 'sa2kit/qqbot/ui/web'],
  ['sa2kit/qqbot/server', 'sa2kit/qqbot/server'],
  ['sa2kit/mmd/admin', 'sa2kit/mmd/admin'],
  ['sa2kit/mmd/server', 'sa2kit/mmd/server'],
  ['sa2kit/mmd/fx', 'sa2kit/mmd/fx'],
  ['sa2kit/universalExport/client', 'sa2kit/universalExport/client'],
  ['sa2kit/universalExport/server', 'sa2kit/universalExport/server'],
  ['sa2kit/universalExport', 'sa2kit/universalExport'],
  ['sa2kit/universalFile/server', 'sa2kit/universalFile/server'],
  ['sa2kit/universalFile/client', 'sa2kit/universalFile/client'],
  ['sa2kit/universalFile', 'sa2kit/universalFile'],
  ['sa2kit/ai/llm/ui/web', 'sa2kit/ai/llm/ui/web'],
  ['sa2kit/ai/llm/ui/miniapp', 'sa2kit/ai/llm/ui/miniapp'],
  ['sa2kit/ai/llm/ui/rn', 'sa2kit/ai/llm/ui/rn'],
  ['sa2kit/ai/llm/ui/electron', 'sa2kit/ai/llm/ui/electron'],
  ['sa2kit/ai/llm/core', 'sa2kit/ai/llm/core'],
  ['sa2kit/ai/llm/web', 'sa2kit/ai/llm/web'],
  ['sa2kit/ai/llm/miniapp', 'sa2kit/ai/llm/miniapp'],
  ['sa2kit/ai/llm/rn', 'sa2kit/ai/llm/rn'],
  ['sa2kit/ai/llm/electron', 'sa2kit/ai/llm/electron'],
  ['sa2kit/ai/llm', 'sa2kit/ai/llm'],
  ['sa2kit/mikuFusionGame', 'sa2kit/mikuFusionGame'],
  ['sa2kit/mikuFireworks3D', 'sa2kit/mikuFireworks3D'],
  ['sa2kit/testYourself', 'sa2kit/testYourself'],
  ['sa2kit/screenReceiver', 'sa2kit/screenReceiver'],
  ['sa2kit/vocaloidBooth', 'sa2kit/vocaloidBooth'],
  ['sa2kit/festivalCard', 'sa2kit/festivalCard'],
  ['sa2kit/navigation', 'sa2kit/navigation'],
  ['sa2kit/portfolio', 'sa2kit/portfolio'],
  ['sa2kit/calendar', 'sa2kit/calendar'],
  ['sa2kit/audioDetection', 'sa2kit/audioDetection'],
  ['sa2kit/bubbleShooter', 'sa2kit/bubbleShooter'],
  ['sa2kit/music/server', 'sa2kit/music/server'],
  ['sa2kit/music', 'sa2kit/music'],
  ['sa2kit/mmd', 'sa2kit/mmd'],
  ['sa2kit/components', 'sa2kit/components'],
  ['sa2kit/imageCrop', 'sa2kit/imageCrop'],
  ['sa2kit/analytics', 'sa2kit/analytics'],
  ['sa2kit/config', 'sa2kit/config'],
  ['sa2kit/ossFile', 'sa2kit/ossFile'],
  ['@qhr123/sa2kit/components', '@qhr123/sa2kit/components'],
  ['@qhr123/sa2kit/mmd', '@qhr123/sa2kit/mmd'],
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
