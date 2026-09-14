#!/usr/bin/env node
/**
 * 从 pnpm-workspace.yaml 去掉 native globs（幂等）。
 * 用法：pnpm native:disable && pnpm install
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const file = join(root, 'pnpm-workspace.yaml');
const linesToDrop = new Set(["  - 'app_mobile/*'", "  - 'app_desktop/*'"]);

const next = readFileSync(file, 'utf8')
  .split('\n')
  .filter((line) => !linesToDrop.has(line.trimEnd()))
  .join('\n');

writeFileSync(file, next);
console.log('disabled app_mobile/* + app_desktop/* in pnpm-workspace.yaml');
console.log('next: pnpm install');
