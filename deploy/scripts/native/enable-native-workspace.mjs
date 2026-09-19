#!/usr/bin/env node
/**
 * 把既有 @profile 移动端 / 桌面端写回 pnpm-workspace.yaml（幂等）。
 * 不用 app_mobile/* / app_desktop/* 通配：同目录还有仅挂载、不进 workspace 的子仓。
 * 用法：pnpm native:enable && pnpm install
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '../../..');
const file = join(root, 'pnpm-workspace.yaml');
const entries = [
  "  - 'app_mobile/calendar-mobile'",
  "  - 'app_mobile/teach-hub-mobile'",
  "  - 'app_desktop/teach-hub-desktop'",
  "  - 'app_desktop/lan-drop'",
];

let text = readFileSync(file, 'utf8');
const missing = entries.filter((line) => !text.includes(`\n${line}\n`));
if (missing.length === 0) {
  console.log('native workspace entries already enabled');
  process.exit(0);
}

const anchor = "  - 'host/*'\n";
if (!text.includes(anchor)) {
  console.error('unexpected pnpm-workspace.yaml shape; add native package paths manually');
  process.exit(1);
}

text = text.replace(anchor, `${anchor}${missing.join('\n')}\n`);
writeFileSync(file, text);
console.log('enabled @profile mobile/desktop paths in pnpm-workspace.yaml');
console.log('next: pnpm install');
