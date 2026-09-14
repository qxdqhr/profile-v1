#!/usr/bin/env node
/**
 * 主站最小 submodule：sa2kit + sa2kit-ui。缺则 install 前失败并给出命令。
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const required = [
  'packages/sa2kit/package.json',
  'packages/sa2kit-ui/package.json',
];

const missing = required.filter((rel) => !existsSync(join(root, rel)));
if (missing.length === 0) process.exit(0);

console.error(
  '[workspace] required library submodules missing:\n' +
    missing.map((m) => `  - ${m}`).join('\n') +
    '\n\nrun:\n' +
    '  git submodule update --init --recursive packages/sa2kit packages/sa2kit-ui\n',
);
process.exit(1);
