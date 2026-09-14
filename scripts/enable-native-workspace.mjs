#!/usr/bin/env node
/**
 * 把 app_mobile/* / app_desktop/* 写回 pnpm-workspace.yaml（幂等）。
 * 用法：pnpm native:enable && pnpm install
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const file = join(root, 'pnpm-workspace.yaml');
const mobile = "  - 'app_mobile/*'";
const desktop = "  - 'app_desktop/*'";

let text = readFileSync(file, 'utf8');
if (text.includes("\n  - 'app_mobile/*'\n") && text.includes("\n  - 'app_desktop/*'\n")) {
  console.log('native workspace globs already enabled');
  process.exit(0);
}

const anchor = "  - 'host/*'\n";
if (!text.includes(anchor)) {
  console.error('unexpected pnpm-workspace.yaml shape; add app_mobile/* and app_desktop/* manually');
  process.exit(1);
}

text = text.replace(
  anchor,
  `${anchor}${mobile}\n${desktop}\n`,
);
writeFileSync(file, text);
console.log('enabled app_mobile/* + app_desktop/* in pnpm-workspace.yaml');
console.log('next: pnpm install');
