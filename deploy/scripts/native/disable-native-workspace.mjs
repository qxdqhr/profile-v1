#!/usr/bin/env node
/**
 * 从 pnpm-workspace.yaml 去掉 native 包路径（幂等，含旧的通配行）。
 * 用法：pnpm native:disable && pnpm install
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '../../..');
const file = join(root, 'pnpm-workspace.yaml');
const linesToDrop = new Set([
  "  - 'app_mobile/*'",
  "  - 'app_desktop/*'",
  "  - 'app_mobile/calendar-mobile'",
  "  - 'app_mobile/teach-hub-mobile'",
  "  - 'app_desktop/teach-hub-desktop'",
  "  - 'app_desktop/lan-drop'",
]);

const next = readFileSync(file, 'utf8')
  .split('\n')
  .filter((line) => !linesToDrop.has(line.trimEnd()))
  .join('\n');

writeFileSync(file, next);
console.log('disabled @profile mobile/desktop paths in pnpm-workspace.yaml');
console.log('next: pnpm install');
